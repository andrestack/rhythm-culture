---
name: rc-setup
description: Check and finish the setup of this computer for the Rhythm Culture website. Use on "/rc-setup", "set up this computer", right after the site folder was first downloaded, or when the local preview, git pull or a pull request won't work.
---

# Set up this computer

Bec and Nat are not developers. They use Windows. You do the checks. They do installs and logins.

## Rules

- Run the checks yourself. Report one line per check: "Git: OK".
- Go in order. Stop at the first failure you can't fix, and say what's wrong in plain words.
- They click through installers and type their own logins. You never type a password or code.
- Never change remotes, tokens or credential settings to get past an error. That's Andre's job.
- Interactive commands (marked ⌨) go in the app's Terminal panel, so they can press Enter and read the code.

## Checks

| # | Check | Run | Pass | If it fails |
|---|---|---|---|---|
| 1 | Right folder | `git remote get-url origin` | contains `andrestack/rhythm-culture` | Wrong folder. Ask which folder holds the site. |
| 2 | Git | `git --version` | prints a version | Install Git for Windows from git-scm.com. Default options. |
| 3 | Node 24 | `node -v` | starts with `v24` | Install Node 24 LTS from nodejs.org. Not a newer version. |
| 4 | GitHub CLI | `gh --version` | prints a version | Install from cli.github.com. Default options. |
| 5 | GitHub login | `gh auth status` | "Logged in to github.com" | ⌨ `gh auth login --hostname github.com --git-protocol https --web`. They copy the code into the browser. |
| 6 | Git name | `git config user.email` | prints an email | Ask their name and GitHub email. Run `git config --global user.name "<name>"` and `git config --global user.email "<email>"`. |
| 7 | Latest site | `git switch main`, then `git pull` | no error | "Access denied" or "not found": their GitHub account isn't on the repo yet. Andre. |
| 8 | Packages | `npm install` | ends without errors | Network or permission error: Andre. |
| 9 | Preview | start "Rhythm Culture (local preview)" | home page opens at `http://localhost:4321/` | Read the error. "Missing packages": run step 8 again. |

- After installing Git, Node or the GitHub CLI, they restart the Claude app. Then run `/rc-setup` again.
- All green: "This computer is set up. Want the tour?" The tour is the `rhythm-culture-onboarding` skill.

## Andre

andre@hinterlandweb.com, 0461 546 818. Send him the check that failed and the error, copied from the chat.
