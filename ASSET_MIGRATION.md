# Binary asset integrity

All seven original PNG files were successfully restored by the GitHub Actions CI job on 18 October 2026.

Original: `eltawalbeh/Etihadtourswebsite`. Isolated target: `eltawalbeh/etihad_changes`. Repository tree verification confirmed each original PNG is present under its matching path at the same original size.

- `Assets/Images/azerbaijan-cover-01.png`
- `Assets/Images/georgia-cover-01.png`
- `Assets/Images/istanbul-cover-01.png`
- `Assets/Images/kazakhstan-cover-01.png`
- `Assets/Images/russia-cover-01.png`
- `Assets/Images/trabzon-cover-01.png`
- `src/imports/image.png`

GitHub Actions checks file presence and downloads missing files from the source repository. The PNGs have not been fabricated or modified.

## Performance follow-up

The source destination PNGs are roughly 2.5–2.8 MB each; convert to WebP/AVIF and serve responsive sizes when placed on the public website. Existing pages may display remote Unsplash or CMS-sourced images instead of these local assets.
