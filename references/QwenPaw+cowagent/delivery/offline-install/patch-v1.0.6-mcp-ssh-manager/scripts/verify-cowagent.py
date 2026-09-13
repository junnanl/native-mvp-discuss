from agent.tools.mcp.mcp_client import McpClient


EXPECTED_TOOLS = {
    "ssh_list_servers",
    "ssh_execute",
    "ssh_upload",
    "ssh_download",
    "ssh_sync",
    "ssh_session_start",
    "ssh_session_send",
    "ssh_session_list",
    "ssh_session_close",
    "ssh_health_check",
    "ssh_service_status",
    "ssh_process_manager",
    "ssh_monitor",
    "ssh_tail",
    "ssh_alert_setup",
    "ssh_backup_create",
    "ssh_backup_list",
    "ssh_backup_restore",
    "ssh_backup_schedule",
    "ssh_db_dump",
    "ssh_db_import",
    "ssh_db_list",
    "ssh_db_query",
    "ssh_deploy",
    "ssh_execute_sudo",
    "ssh_alias",
    "ssh_command_alias",
    "ssh_hooks",
    "ssh_profile",
    "ssh_connection_status",
    "ssh_tunnel_create",
    "ssh_tunnel_list",
    "ssh_tunnel_close",
    "ssh_key_manage",
    "ssh_execute_group",
    "ssh_group_manage",
    "ssh_history",
}


def main():
    config = {
        "name": "ssh-manager",
        "command": "/opt/node-v24.18.0-linux-x64/bin/node",
        "args": [
            "/opt/cowagent/toolpacks/mcp/mcp-ssh-manager/src/secure-entrypoint.mjs"
        ],
        "env": {
            "HOME": "/home/agent/cow/mcp-ssh-manager/home",
            "SSH_MANAGER_HOME": "/home/agent/cow/mcp-ssh-manager/home/.ssh-manager",
            "SSH_ENV_PATH": "/home/agent/cow/mcp-ssh-manager/config/servers.env",
            "SSH_CONFIG_PATH": "/home/agent/cow/mcp-ssh-manager/config/servers.toml",
            "PREFER_TOML_CONFIG": "true",
            "PATH": "/opt/cowagent/toolpacks/mcp/mcp-ssh-manager/runtime/bin:/usr/local/bin:/usr/bin:/bin",
            "LD_LIBRARY_PATH": "/opt/cowagent/toolpacks/mcp/mcp-ssh-manager/runtime/lib",
        },
        "timeout": 30,
    }
    client = McpClient(config)
    try:
        if not client.initialize():
            raise SystemExit("CowAgent MCP handshake failed")
        actual = {tool["name"] for tool in client.list_tools()}
        if actual != EXPECTED_TOOLS:
            raise SystemExit(f"unexpected MCP tools: {sorted(actual)}")
        print("CowAgent MCP handshake passed with all 37 tools")
    finally:
        client.shutdown()


if __name__ == "__main__":
    main()
