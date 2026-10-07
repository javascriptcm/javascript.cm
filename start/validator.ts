/*
|--------------------------------------------------------------------------
| Validator file
|--------------------------------------------------------------------------
|
| Global VineJS configuration: Luxon dates and French error messages.
|
*/

import { DateTime } from 'luxon'
import vine, { SimpleMessagesProvider, VineDate } from '@vinejs/vine'

declare module '@vinejs/vine/types' {
  interface VineGlobalTransforms {
    date: DateTime
  }
}

VineDate.transform((value) => DateTime.fromJSDate(value))

vine.messagesProvider = new SimpleMessagesProvider(
  {
    'required': 'Ce champ est obligatoire.',
    'string': 'Ce champ doit être un texte.',
    'email': 'Adresse e-mail invalide.',
    'url': 'Adresse web invalide (elle doit commencer par https://).',
    'minLength': 'Au moins {{ min }} caractères.',
    'maxLength': 'Au plus {{ max }} caractères.',
    'fixedLength': 'Exactement {{ size }} caractères.',
    'confirmed': 'La confirmation ne correspond pas.',
    'sameAs': 'La confirmation ne correspond pas.',
    'regex': 'Format invalide.',
    'alphaNumeric': 'Lettres et chiffres uniquement.',
    'unique': 'Cette valeur est déjà utilisée.',
    'exists': 'Valeur inconnue.',
    'database.unique': 'Cette valeur est déjà utilisée.',
    'database.exists': 'Valeur inconnue.',
    'in': 'Valeur non autorisée.',
    'notIn': 'Valeur non autorisée.',
    'enum': 'Valeur non autorisée.',
    'number': 'Ce champ doit être un nombre.',
    'boolean': 'Valeur invalide.',
    'array': 'Liste invalide.',
    'array.minLength': 'Choisissez au moins {{ min }} élément(s).',
    'array.maxLength': 'Choisissez au plus {{ max }} éléments.',
    'activeUrl': 'Cette adresse web ne répond pas.',
  },
  {
    username: 'nom d’utilisateur',
    name: 'nom',
    email: 'e-mail',
    password: 'mot de passe',
    title: 'titre',
    body: 'contenu',
  }
)
