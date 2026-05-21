# Criar GIF de demonstração (opcional)

Com [ffmpeg](https://ffmpeg.org/download.html) instalado:

```bash
cd docs/images
ffmpeg -y -framerate 0.4 -loop 0 -i dashboard.png -i charts.png -i news.png -i coin-page.png \
  -filter_complex "[0:v]scale=1200:-2,setsar=1,fps=1[v0];[1:v]scale=1200:-2,setsar=1,fps=1[v1];[2:v]scale=1200:-2,setsar=1,fps=1[v2];[3:v]scale=1200:-2,setsar=1,fps=1[v3];[v0][v1][v2][v3]concat=n=4:v=1:a=0,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
  -loop 0 demo.gif
```

Depois adicione no README: `![Demo](docs/images/demo.gif)`
