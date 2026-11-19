# İstatistik Teorisi Notları

Bu repo, LaTeX kaynak dosyalarını **Pandoc** ile HTML’e çevirerek **GitHub Pages** üzerinden yayınlamayı otomatikleştirir.

- `src/` : LaTeX (`.tex`) dosyaları.
- `assets/style.css` : Basit stil dosyası.
- `build.ps1` : Pandoc ile HTML üretir.
- `.github/workflows/build.yml` : GitHub Actions CI/CD.

> **Nasıl çalışır?**
> 1. `git push` ile `master` şubesine gönderildiğinde GitHub Actions çalışır.
> 2. `build.ps1` çalıştırılarak `index.html` oluşturulur.
> 3. `gh-pages` şubesine dağıtılır ve **GitHub Pages** üzerinden `https://<kullanıcı>.github.io/<repo>` adresinde sunulur.
