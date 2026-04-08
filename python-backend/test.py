import asyncio
import sys
import traceback
sys.path.append('.')
from app.agents.motivation import motivation_agent

async def main():
    try:
        res = await motivation_agent.encourage({'current_skill': 'math'})
        print(res)
    except Exception as e:
        with open('traceback.log', 'w') as f:
            traceback.print_exc(file=f)

asyncio.run(main())
