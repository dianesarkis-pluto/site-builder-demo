#!/bin/sh
# Pre-edit guardrail: page edit history is system-of-record. Direct edits
# to data/*-edits.json bypass the snapshot + drift policy; /reconcile is
# the sanctioned path (see the Feb PG-0118 incident).
# Exit 2 blocks the tool call; stderr is shown to Claude so it self-corrects.
# Fail closed: the matcher (Edit|Write|MultiEdit) guarantees a file_path,
# so unparseable or empty input means something is wrong; deny, don't allow.

input=$(cat)
file_path=$(printf '%s' "$input" | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
  try { process.stdout.write(JSON.parse(d).tool_input?.file_path || ''); }
  catch(e) { process.stderr.write('parse-error: '+e.message+'\n'); process.exit(1); }
});")
node_exit=$?
if [ $node_exit -ne 0 ] || [ -z "$file_path" ]; then
  echo "Blocked: could not determine the target file from tool input; denying by default." >&2
  exit 2
fi

case "$file_path" in
  *data/*-edits.json)
    echo "Blocked: $file_path is page edit history (system-of-record)." >&2
    echo "Use /reconcile <pageId>; it snapshots and enforces the drift policy." >&2
    exit 2
    ;;
esac
exit 0
