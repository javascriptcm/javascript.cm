#!/usr/bin/env bash
# Forced command of the GitHub Actions SSH key (~/.ssh/authorized_keys):
#   command="/home/brightky/bin/deploy-jscm",no-pty,... ssh-ed25519 …
# Installed as ~/bin/deploy-jscm. Accepts exactly one of:
#   deploy [staging]            deploy the staging branch
#   deploy production           deploy main to production
#   preview up <pr> <sha>       create or update the preview of a pull request
#   preview down <pr>           remove the preview of a pull request
set -euo pipefail

main() {
  local -a args
  read -r -a args <<< "${SSH_ORIGINAL_COMMAND:-deploy}"

  case "${args[0]:-}" in
    deploy)
      local target="${args[1]:-staging}" dir branch
      case "$target" in
        staging) dir="$HOME/apps/javascript.cm" branch=staging ;;
        production) dir="$HOME/apps/javascript.cm-prod" branch=main ;;
        *) echo "unknown target: $target" >&2; exit 2 ;;
      esac
      cd "$dir"
      git fetch -q --prune origin "$branch"
      git checkout -q -B "$branch" "origin/$branch"
      exec ./deploy/deploy.sh "$branch"
      ;;
    preview)
      local action="${args[1]:-}" pr="${args[2]:-}" sha="${args[3]:-}"
      [[ "$action" == up || "$action" == down ]] || { echo "bad action" >&2; exit 2; }
      [[ "$pr" =~ ^[0-9]{1,5}$ ]] || { echo "bad pull request number" >&2; exit 2; }
      [[ "$action" == down || "$sha" =~ ^[0-9a-f]{7,40}$ ]] || { echo "bad commit" >&2; exit 2; }
      # The preview script always comes from the staging branch (reviewed code),
      # never from the pull request itself.
      cd "$HOME/apps/javascript.cm"
      git fetch -q origin staging
      git show origin/staging:deploy/preview.sh > "$HOME/bin/.preview.sh"
      exec bash "$HOME/bin/.preview.sh" "$action" "$pr" "$sha"
      ;;
    *)
      echo "unknown command" >&2
      exit 2
      ;;
  esac
}

exec < /dev/null > >(tee -a "$HOME/apps/deploy.log") 2>&1
main
