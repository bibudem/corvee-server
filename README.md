# Corvee server

## Installation

```
git clone https://github.com/bibudem/corvee-server.git
cd corvee-server
npm install
```

## Pour commencer

Exécutez la commande suivante dans le dossier du projet:

```
npm run dev
```

## Pour créer un `release`

Exécuter la commande suivante, en adaptant le niveau de version (`major`, `minor` ou `patch`) en fonction des commits faits depuis le dernier `release`:

```
npm version major|minor|patch -m "Bump v%s" && npm run build
```

Effectuer un commit des fichiers build, avec un message du genre:

```
git add --all dist && git commit -m "chore:Build pour v3.0.1" -m "Release-As: 3.0.1" && git push
```

Puis naviguer sur les [pull requests du dépôt GitHub](https://github.com/bibudem/corvee-server/pulls) et acceptez le pull request généré par _Release Please_.
