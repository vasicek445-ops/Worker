#!/bin/bash
# megan-executor.sh — Spouští Claude Code bez VS Code environment
# Použití: ./megan-executor.sh "úkol pro Claude Code"

if [ -z "$1" ]; then
    echo "❌ Chybí úkol. Použití: ./megan-executor.sh \"úkol\""
    exit 1
fi

# Odstranění CLAUDE* proměnných aby nedošlo k nested session erroru
unset CLAUDE_DEV
unset CLAUDECODE
unset CLAUDE_CODE_SSE_PORT
unset CLAUDE_CODE_ENTRYPOINT

# Spuštění Claude Code
exec claude -p "$1" --dangerously-skip-permissions --output-format text
