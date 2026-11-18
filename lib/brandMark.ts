// Marque Blueprint Modular embarquée en data URI (PNG 64×64, rendu de public/img/modular-mark.svg :
// « jeu de pièces », quatre pièces de formes différentes dont une vermillon ; validée par Rémi
// le 18/11/2026, sans aucun emprunt à la grammaire du logo .maker).
//
// Pourquoi inliner plutôt que `<img src="/img/icon-pwa-192.png">` ?
// La marque doit s'afficher partout (nav vitrine, barre de titre, sidebar) sans
// jamais dépendre d'un fichier statique servi séparément. Un asset sous public/
// peut manquer côté serveur (build standalone qui n'a pas recopié public/, cache
// CDN, déploiement partiel) et laisser une image cassée à la place du logo —
// « on a perdu le logo ». Embarquée dans le bundle, la marque ne peut pas tomber
// en 404 : elle suit le code. Les favicons (app/layout.tsx, app/manifest.ts)
// restent eux des fichiers réels — un <link rel="icon"> ne peut pas être inliné.
export const BRAND_MARK_SRC =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAFDElEQVR4nOybbWwURRjH/8/eHvQOaaj2DizYnm3vFNomFI0QPoBo" +
  "/KCSENFgGhEFgahfjIlfTCBqjSYaTfxgsCJBFCoN4kuQlkQ/GNAQ+sWWYEt619a+8FLapojCtb3b22Hm2i4t12t7e3Tvuttfcnsz" +
  "+zLZ5z/P7M48syNjCmTc43ucbHgKDI+AWA5ACwmYhzSCATf49goYXQKptUxl1QO9Lb9Pdh1NcEx2ur3bGaPdRMjBDIQxXCLG3gv2" +
  "BvbzrDLeOeMJIDmyfZt4TZcTkRcmgAvhB9Rd/T3NRxF1llvECOBwFXLj6QCBHDARDCxIKisL9jYfG71/jAAOt3cjP/N7XvMSTAhj" +
  "TOXbMu4JR0b2aQLMycovsdlttWar+dvhntCvMKwO9wTqRX6kpiXZbqsyu/ECYaOdcBDDtkc3/Gm/kx9aBstAxUM2C0FcrructKCV" +
  "J12wFKw7qEqFcgYWPGc94wXkziD1WZm3gUdhVQirJN4r8MCiEMODMu/0eGBZaJHMHwaLJh4SxPL16VOTnnO1uwctDQ3814hzZ2px" +
  "sfUfJILPCay9W8LyTAmlmUNv67r/VNTz38k+Ff4gkoa47eR0+1iiF05FgNGokQhqKg/jp337oSrKhOfO5X75hkfGjvtssNH4FRPh" +
  "nfsvOyL4rC2CiUubHEO6vJLNhvVbNmP3VxXI88YfXy11Eo4/PAev5spxjReIY6/nyfhxhR1FSQ7KDe3zex7w4bUPymGz22OOOfid" +
  "7CmWUeCc+i0Vz5fweZEd9sRa8BgMH/QsXLIYz2zfFrP/rfttyHMkfjvimjc9NuglJaO+J18oQ2FJiZZfkUl4abF+I3by58VD8/W5" +
  "QUoEkCQJazes1/Ivc+Ml0u/H4trnc/QJKCNF3Jubp6XznUk04mEKHfrKSJ0AnlwtvSQjeQHy582gJiAIhUJaelBNuCsSg94yUiZA" +
  "pz+gpRuvJy+A3jJSJkBHoFlLn78DApyfSQIooTD++KVayx/tUjEY0S9CiLv/kcsR6CElAogxwZULF7R8az9DRac+AwRiTNA2AF0Y" +
  "LkBbkx8nvjscs/+LDgUtQRWJ8vf/KvZ26h8SGSqAGBUe+PAjMDXW0BAj7PInZogYFb7dFIaKJDpRMABhePXBSuxY9wTaA4G459Ve" +
  "Y/CdHMSediVqXDzEsQruMUtPhdBwA0kxbR0hvQER4QOf8DZ9rDsy7QERga6AiJkw5RxgIuhqAomGxOKxdfWaaSkvESzvAbMCwOLM" +
  "CgCLMysALM6sAEgR//b1jZs2mrSICY5OG01axARHp40mLWKCf1afQHgwhFSQFjHBro4O1ByqRCpIm5jg8W8P4XJ7O4wmbWKCSjiM" +
  "bz7+FEaTVjHBprp6vLLmsag3iGuMQGZggwSaizuM3pig+Iboh4q9OPPrbyhZtRIFRcv4rwhZ7mn4lpOxa+Rw+9p4UDkPFoQHl5t4" +
  "E2BdsCysS3wpWg/rUi8xpv4MqxJhVdE5JafL+xeISmElGM4Ge/zLh16DKpXDaqh4V/xps4qW8oLh2hdJrSMUJtoqFhTB5EQXTSnK" +
  "iyP5WwJ0+8/yF+MWmJihZXPYHLraem5k35ivC5VgX6PdkVXHp+o38N6hHSZC1LzKsHGgJxB/4eQIdldhqQypigg+mACxdFYhbIp6" +
  "+W1MvHg627uNEb0zoxdPE3s/2B3YhwQWT8eQkV2wjiR6Gkxamf7L53GRZ0/zfA1390mnnW8CAAD//24JjFAAAAAGSURBVAMAVqoH" +
  "xrGtEuQAAAAASUVORK5CYII=";base64,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";
