const Book = require('../models/books');
const fs = require('fs');
const path = require('path');

// Récupérer tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

// Récupérer un livre spécifique
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

// Créer un nouveau livre
exports.createBook = async (req, res, next) => {
  try {
      // Vérifie si req.body.book est défini
      if (!req.body.book) {
          return res.status(400).json({ error: 'Les données du livre sont manquantes' });
      }

      const bookObject = JSON.parse(req.body.book);
      delete bookObject._id;
      delete bookObject._userId;

      // Crée l'objet Book
      const book = new Book({
          ...bookObject,
          userId: req.auth.userId,
          imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
          averageRating: bookObject.ratings && bookObject.ratings.length ? calculateAverageRating(bookObject.ratings) : 0
      });

      await book.save();

      res.status(201).json({ message: 'Livre enregistré !' });
  } catch (error) {

      console.error('Erreur lors de la création du livre :', error);
      res.status(400).json({ error: 'Une erreur s\'est produite lors de la création du livre' });
  }
};

// Modifier un livre
exports.modifyBook = (req, res, next) => {
  const bookObject = { ...req.body };
  Book.updateOne({ _id: req.params.id, userId: req.auth.userId }, { ...bookObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Livre modifié !' }))
    .catch(error => res.status(400).json({ error }));
};

// Supprimer un livre
exports.deleteBook = (req, res, next) => {
  Book.deleteOne({ _id: req.params.id, userId: req.auth.userId })
    .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
    .catch(error => res.status(400).json({ error }));
};

// Ajouter une note à un livre
exports.ratingBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      const newRating = {
        userId: req.auth.userId,
        grade: req.body.grade
      };

      // Vérifier si l'utilisateur a déjà noté ce livre
      const existingRating = book.ratings.find(rating => rating.userId === req.auth.userId);
      if (existingRating) {
        return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
      }

      // Ajouter la nouvelle note et recalculer la moyenne
      book.ratings.push(newRating);
      book.averageRating = calculateAverageRating(book.ratings);

      book.save()
        .then(() => res.status(200).json({ message: 'Note ajoutée !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(404).json({ error }));
};

// Récupérer les livres ayant les meilleures notes
exports.getBestRatedBooks = (req, res, next) => {
  Book.find()
      .then(books => {
          books.sort((a, b) => b.averageRating - a.averageRating);
          const bestRatedBooks = books.slice(0, 3);
          res.status(201).json(bestRatedBooks)})
      .catch(error => res.status(404).json({ error }));
  };

// Fonction pour calculer la moyenne des notes
function calculateAverageRating(ratings) {
  const total = ratings.reduce((sum, rating) => sum + rating.grade, 0);
  return ratings.length ? total / ratings.length : 0;
}