# NAZRAH public website

Independent, buildless public presentation website for the NAZRAH commodity intelligence and trade operations platform.

## Online website

The public website is deployed through GitHub Pages from this repository.

<https://hmzerr22-pixel.github.io/nazrah-public-website/>

## Local preview

From the project root:

```powershell
python -m http.server 3020 --directory dist
```

Then open `http://127.0.0.1:3020`.

The request-demo form is intentionally local-only in this prototype. It stores a draft in browser local storage and does not transmit data.
