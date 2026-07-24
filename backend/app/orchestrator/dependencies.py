DEPENDENCIES = {
    "research": [],
    "sdg": ["research"],
    "policy": ["research"],
    "environmental": ["research"],
    "finance": ["research"],
    "risk": ["research"],
    "timeline": ["research"],
    "report": []
}

GRAPH_ORDER = [
    "research",
    "sdg",
    "policy",
    "environmental",
    "finance",
    "risk",
    "timeline",
]


def resolve_dependencies(required_agents):
    required = set(required_agents)

    # Recursively include dependencies
    changed = True
    while changed:
        changed = False

        for agent in list(required):
            for dep in DEPENDENCIES.get(agent, []):
                if dep not in required:
                    required.add(dep)
                    changed = True

    execution_order = [
        agent
        for agent in GRAPH_ORDER
        if agent in required
    ]

    execution_order.append("report")

    return execution_order