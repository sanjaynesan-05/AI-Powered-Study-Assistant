#!/usr/bin/env python3
"""Test script for Wellness MCP Server"""

import asyncio
import json
import os
import subprocess
import sys
import time
from typing import Any, Dict


class MCPServerTester:
    """Simulates MCP client to test the wellness server"""

    def __init__(self):
        self.server_process = None

    def start_server(self):
        """Start the MCP server as a subprocess"""
        try:
            # Set environment variables for testing
            env = os.environ.copy()
            env['GEMINI_API_KEY'] = 'test-key'  # Mock key for testing

            # Start server process
            self.server_process = subprocess.Popen(
                [sys.executable, 'wellness_mcp_server.py'],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                env=env,
                cwd=os.path.dirname(__file__)
            )
            print("✅ MCP Server started")
            return True
        except Exception as e:
            print(f"❌ Failed to start server: {e}")
            return False

    def send_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Send MCP request and get response"""
        if not self.server_process:
            return {'error': 'Server not running'}

        try:
            # Send request
            request_json = json.dumps(request) + '\n'
            self.server_process.stdin.write(request_json)
            self.server_process.stdin.flush()

            # Read response (with timeout)
            time.sleep(0.5)  # Allow server time to respond
            if self.server_process.poll() is not None:
                # Server exited
                stdout, stderr = self.server_process.communicate()
                return {'error': f'Server exited: {stdout}\n{stderr}'}

            # Try to read line
            try:
                response_line = self.server_process.stdout.readline()
                if response_line:
                    return json.loads(response_line.strip())
            except Exception as e:
                return {'error': f'Failed to read response: {e}'}

        except Exception as e:
            return {'error': f'Communication error: {e}'}

    def test_initialization(self):
        """Test MCP initialization"""
        print("\n🔄 Testing MCP Initialization...")
        init_request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": True
                },
                "clientInfo": {
                    "name": "test-client",
                    "version": "1.0.0"
                }
            }
        }

        init_response = self.send_request(init_request)
        print(f"   Init response: {json.dumps(init_response, indent=2)}")

    def test_list_tools(self):
        """Test tool listing"""
        print("\n🛠️  Testing Tool Listing...")
        tools_request = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/list"
        }

        tools_response = self.send_request(tools_request)
        print(f"   Available tools: {len(tools_response.get('result', {}).get('tools', []))}")
        for tool in tools_response.get('result', {}).get('tools', []):
            print(f"   - {tool['name']}: {tool['description'][:50]}...")

    def test_mood_checkin(self):
        """Test mood check-in tool"""
        print("\n😊 Testing Mood Check-in Tool...")
        mood_request = {
            "jsonrpc": "2.0",
            "id": 3,
            "method": "tools/call",
            "params": {
                "name": "mood_check_in",
                "arguments": {
                    "mood_score": 8,
                    "text_description": "Feeling good after exercise",
                    "user_id": "test_user"
                }
            }
        }

        mood_response = self.send_request(mood_request)
        print(f"   Mood check-in result: {json.dumps(mood_response, indent=2)[:200]}...")

    def test_goal_creation(self):
        """Test wellness goal creation"""
        print("\n🎯 Testing Wellness Goal Creation...")
        goal_request = {
            "jsonrpc": "2.0",
            "id": 4,
            "method": "tools/call",
            "params": {
                "name": "set_wellness_goal",
                "arguments": {
                    "goal_type": "meditation",
                    "description": "Meditate for 10 minutes daily",
                    "target_value": {"minutes_per_day": 10, "days_per_week": 7},
                    "user_id": "test_user"
                }
            }
        }

        goal_response = self.send_request(goal_request)
        print(f"   Goal creation result: {json.dumps(goal_response, indent=2)[:200]}...")

    def stop_server(self):
        """Stop the server process"""
        if self.server_process:
            print("\n🛑 Stopping MCP Server...")
            try:
                self.server_process.terminate()
                self.server_process.wait(timeout=5)
                print("✅ Server stopped successfully")
            except Exception as e:
                print(f"⚠️  Error stopping server: {e}")
                self.server_process.kill()


def main():
    """Run all tests"""
    print("🩺 Testing Wellness MCP Server")
    print("=" * 50)

    tester = MCPServerTester()

    try:
        # Start server
        if not tester.start_server():
            return

        # Give server time to initialize
        time.sleep(2)

        # Run tests
        tester.test_initialization()
        tester.test_list_tools()
        tester.test_mood_checkin()
        tester.test_goal_creation()

        print("\n✅ All tests completed!")

    except KeyboardInterrupt:
        print("\n⚠️  Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Test error: {e}")
    finally:
        tester.stop_server()


if __name__ == "__main__":
    main()
