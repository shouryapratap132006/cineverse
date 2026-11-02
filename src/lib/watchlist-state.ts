// Watchlist state shared by the movie page and the server actions.
// Kept free of imports so `npm test` (node --test) can load it directly.

export type WatchlistStatus = "none" | "want-to-watch" | "watched";
export type ListedStatus = Exclude<WatchlistStatus, "none">;
export type DbWatchlistStatus = "WANT_TO_WATCH" | "WATCHED";

export interface LibraryState {
  watchlistStatus: WatchlistStatus;
  isFavorite: boolean;
}

/** A click on the movie page's library panel. "none" is "Remove from lists". */
export type LibraryAction = ListedStatus | "favorite" | "none";

export function toDbStatus(status: ListedStatus): DbWatchlistStatus {
  return status === "want-to-watch" ? "WANT_TO_WATCH" : "WATCHED";
}

export function fromDbStatus(
  status: string | null | undefined,
): WatchlistStatus {
  if (status === "WANT_TO_WATCH") return "want-to-watch";
  if (status === "WATCHED") return "watched";
  return "none";
}

/** Clicking the status a movie already has removes it, exactly as `toggleWatchlist` does on the server. */
export function nextWatchlistStatus(
  current: WatchlistStatus,
  clicked: ListedStatus,
): WatchlistStatus {
  return current === clicked ? "none" : clicked;
}

/** The state the UI shows the moment a button is clicked, before the server answers. */
export function applyLibraryAction(
  state: LibraryState,
  action: LibraryAction,
): LibraryState {
  switch (action) {
    case "none":
      return { watchlistStatus: "none", isFavorite: false };
    case "favorite":
      return { ...state, isFavorite: !state.isFavorite };
    default:
      return {
        ...state,
        watchlistStatus: nextWatchlistStatus(state.watchlistStatus, action),
      };
  }
}

/** What the watchlist server actions return. Fields left out mean "unchanged by this action". */
export type LibraryResult =
  | { success: true; watchlistStatus?: WatchlistStatus; isFavorite?: boolean }
  | { success: false; error?: string };

/**
 * Runs one library change optimistically: shows the expected state at once, then the state the
 * server saved, or the previous state again with an error message if the request fails.
 */
export async function runLibraryAction(
  before: LibraryState,
  action: LibraryAction,
  send: () => Promise<LibraryResult>,
  show: (state: LibraryState) => void,
): Promise<{ state: LibraryState; error: string | null }> {
  const expected = applyLibraryAction(before, action);
  show(expected);
  try {
    const res = await send();
    if (!res.success) throw new Error(res.error);
    const saved: LibraryState = {
      watchlistStatus: res.watchlistStatus ?? expected.watchlistStatus,
      isFavorite: res.isFavorite ?? expected.isFavorite,
    };
    show(saved);
    return { state: saved, error: null };
  } catch (err) {
    show(before);
    const reason =
      err instanceof Error && err.message ? err.message : "Please try again.";
    return { state: before, error: `Couldn't update your lists. ${reason}` };
  }
}
