// Run with `npm test` (node --test). Node 22.18+ loads the TypeScript module directly.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyLibraryAction,
  fromDbStatus,
  nextWatchlistStatus,
  runLibraryAction,
  toDbStatus,
} from "../src/lib/watchlist-state.ts";

const empty = { watchlistStatus: "none", isFavorite: false };
const wanted = { watchlistStatus: "want-to-watch", isFavorite: false };

/** A request the test resolves by hand, so it can look at the UI while the request is in flight. */
function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function recorder() {
  const shown = [];
  return { shown, show: (state) => shown.push(state) };
}

describe("nextWatchlistStatus", () => {
  it("adds a movie that is not on the watchlist", () => {
    assert.equal(nextWatchlistStatus("none", "want-to-watch"), "want-to-watch");
  });

  it("removes the movie when its current status is clicked again, as the server does", () => {
    assert.equal(nextWatchlistStatus("want-to-watch", "want-to-watch"), "none");
    assert.equal(nextWatchlistStatus("watched", "watched"), "none");
  });

  it("moves the movie between statuses instead of adding a second entry", () => {
    assert.equal(nextWatchlistStatus("want-to-watch", "watched"), "watched");
  });
});

describe("applyLibraryAction", () => {
  it("toggles the favorite without touching the watchlist status", () => {
    assert.deepEqual(applyLibraryAction(wanted, "favorite"), {
      watchlistStatus: "want-to-watch",
      isFavorite: true,
    });
  });

  it("clears both lists for Remove from lists", () => {
    assert.deepEqual(
      applyLibraryAction(
        { watchlistStatus: "watched", isFavorite: true },
        "none",
      ),
      empty,
    );
  });
});

describe("runLibraryAction", () => {
  it("shows the movie as added before the server answers", async () => {
    const request = deferred();
    const { shown, show } = recorder();
    const done = runLibraryAction(
      empty,
      "want-to-watch",
      () => request.promise,
      show,
    );

    assert.deepEqual(
      shown,
      [wanted],
      "the button updates while the request is still running",
    );
    request.resolve({ success: true, watchlistStatus: "want-to-watch" });
    assert.deepEqual(await done, { state: wanted, error: null });
  });

  it("shows the movie as removed when its status is clicked again", async () => {
    const { shown, show } = recorder();
    const result = await runLibraryAction(
      wanted,
      "want-to-watch",
      async () => ({ success: true, watchlistStatus: "none" }),
      show,
    );

    assert.deepEqual(shown[0], empty);
    assert.deepEqual(result, { state: empty, error: null });
  });

  it("ends on what the server saved, not on the guess", async () => {
    const { show } = recorder();
    const result = await runLibraryAction(
      empty,
      "want-to-watch",
      async () => ({ success: true, watchlistStatus: "watched" }),
      show,
    );

    assert.equal(result.state.watchlistStatus, "watched");
  });

  it("puts the previous state back and explains why when the server refuses", async () => {
    const { shown, show } = recorder();
    const result = await runLibraryAction(
      empty,
      "want-to-watch",
      async () => ({ success: false, error: "Unauthorized" }),
      show,
    );

    assert.deepEqual(shown, [wanted, empty]);
    assert.deepEqual(result, {
      state: empty,
      error: "Couldn't update your lists. Unauthorized",
    });
  });

  it("also reverts when the request itself fails", async () => {
    const { shown, show } = recorder();
    const result = await runLibraryAction(
      wanted,
      "favorite",
      () => Promise.reject(new Error("Network error")),
      show,
    );

    assert.deepEqual(shown.at(-1), wanted);
    assert.equal(result.error, "Couldn't update your lists. Network error");
  });
});

describe("database status mapping", () => {
  it("maps both ways, and treats a missing row as not on the watchlist", () => {
    assert.equal(toDbStatus("want-to-watch"), "WANT_TO_WATCH");
    assert.equal(toDbStatus("watched"), "WATCHED");
    assert.equal(fromDbStatus("WANT_TO_WATCH"), "want-to-watch");
    assert.equal(fromDbStatus("WATCHED"), "watched");
    assert.equal(fromDbStatus(undefined), "none");
  });
});
