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
  "xrGtEuQAAAAASUVORK5CYII=";
