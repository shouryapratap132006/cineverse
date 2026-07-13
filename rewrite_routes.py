import os
import re

directory = 'src/app/api/ai'

routes = [
    ('recommend/route.ts', 'recommendationService.getRecommendations', '/ai/recommend'),
    ('knowledge-graph/route.ts', 'semanticSearchService.generateKnowledgeGraph', '/ai/knowledge-graph'),
    ('daily/route.ts', 'tasteService.getDailyTasteMatch', '/ai/daily'),
    ('search/route.ts', 'semanticSearchService.search', '/ai/search'),
    ('profile/route.ts', 'tasteService.analyzeTasteProfile', '/ai/profile'),
    ('review/route.ts', 'reviewService.analyzeReview', '/ai/review'),
    ('scene/route.ts', 'semanticSearchService.findScene', '/ai/scene'),
    ('community/route.ts', 'communityService.getDiscussions', '/ai/community'),
    ('watchlist/route.ts', 'watchlistService.analyzeWatchlist', '/ai/watchlist'),
    ('moderation/route.ts', 'moderationService.moderateContent', '/ai/moderation'),
]

template = """    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    const response = await fetch(`${aiServiceUrl}ENDPOINT`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": userId,
      },
      body: JSON.stringify(BODY_ARGS),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI Service error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);"""

for route, service_method, endpoint in routes:
    path = os.path.join(directory, route)
    if not os.path.exists(path):
        continue
        
    with open(path, 'r') as f:
        content = f.read()

    # Find the service call block
    # e.g. const result = await recommendationService.getRecommendations({\n  userId,\n  type,\n  userProfile,\n});
    pattern = r"const result = await " + service_method.replace('.', r'\.') + r"\s*\(\s*\{([\s\S]*?)\}\s*\);"
    match = re.search(pattern, content)
    
    if match:
        args_raw = match.group(1)
        # Parse args, ignoring userId if present, keeping others
        args_lines = [line.strip().strip(',') for line in args_raw.split('\n') if line.strip()]
        args = [arg for arg in args_lines if arg and arg != 'userId' and not arg.startswith('userId:')]
        
        body_args_str = "{" + ", ".join(args) + "}" if args else "{}"
        
        replacement = template.replace('ENDPOINT', endpoint).replace('BODY_ARGS', body_args_str)
        
        new_content = content[:match.start()] + replacement + content[match.end():]
        
        # Remove the old service import
        import_pattern = r"import\s+\{\s*" + service_method.split('.')[0] + r"\s*\}\s+from\s+[^;]+;"
        new_content = re.sub(import_pattern, "", new_content)
        
        with open(path, 'w') as f:
            f.write(new_content)
        print(f"Migrated {route}")
    else:
        print(f"Could not find service call in {route}")
