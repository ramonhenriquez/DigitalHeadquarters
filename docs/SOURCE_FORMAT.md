# Optional frontmatter for Homelab-Portfolio documents

Homelab-Portfolio docs work today with no frontmatter: the site takes the
title from the first `#` heading (or the file name) and the "last updated"
date from git history.

If you add frontmatter, the site picks up these fields automatically. All
are optional; plain Markdown keeps working.

```yaml
---
title: Wazuh + Suricata Integration     # overrides the heading/file name
summary: One-sentence description shown in the docs index and command palette.
date: 2026-05                            # when the work was done (YYYY, YYYY-MM or YYYY-MM-DD)
status: deployed                         # deployed | active | experimental | planned
---
```

`date` is the field that would help most: no document currently says when the
work happened, so timeline dates for homelab milestones can't be traced back to
the source repo.
