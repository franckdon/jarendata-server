export const surveyTemplates = {
  CUSTOMER_SATISFACTION: [
    {
      title:
        "Bonjour 👋 Merci pour votre achat chez [Nom de la marque]. Sur une échelle de 1 à 5, êtes-vous satisfait de votre expérience ?",
      type: "RATING",
      order: 1,
      minValue: 1,
      maxValue: 5,
      options: [
        { label: "1 - Très insatisfait", value: "1", order: 1, nextOrder: 2 },
        { label: "2 - Insatisfait", value: "2", order: 2, nextOrder: 2 },
        { label: "3 - Moyen", value: "3", order: 3, nextOrder: 2 },
        { label: "4 - Satisfait", value: "4", order: 4, nextOrder: 3 },
        { label: "5 - Très satisfait", value: "5", order: 5, nextOrder: 3 },
      ],
    },
    {
      title: "Merci pour votre retour. Pouvez-vous nous dire ce qui n’a pas fonctionné ?",
      type: "SINGLE_CHOICE",
      order: 2,
      options: [
        { label: "Livraison lente", value: "slow_delivery", order: 1 },
        { label: "Produit non conforme", value: "wrong_product", order: 2 },
        { label: "Mauvais service", value: "bad_service", order: 3 },
        { label: "Autre", value: "other", order: 4 },
      ],
    },
    {
      title: "Super. Qu’avez-vous le plus apprécié ?",
      type: "SINGLE_CHOICE",
      order: 3,
      options: [
        { label: "Qualité produit", value: "product_quality", order: 1 },
        { label: "Rapidité", value: "speed", order: 2 },
        { label: "Service client", value: "customer_service", order: 3 },
        { label: "Prix", value: "price", order: 4 },
      ],
    },
  ],

  PRICE_TEST: [
    {
      title:
        "Bonjour 👋 Nous travaillons sur un nouveau produit. Seriez-vous prêt à acheter ce produit à quel prix ?",
      type: "SINGLE_CHOICE",
      order: 1,
      options: [
        { label: "5 000 FCFA", value: "5000", order: 1, nextOrder: 2 },
        { label: "10 000 FCFA", value: "10000", order: 2, nextOrder: 2 },
        { label: "15 000 FCFA", value: "15000", order: 3, nextOrder: 2 },
        { label: "Non intéressé", value: "not_interested", order: 4 },
      ],
    },
    {
      title: "Qu’est-ce qui vous motive le plus ?",
      type: "SINGLE_CHOICE",
      order: 2,
      options: [
        { label: "Prix", value: "price", order: 1 },
        { label: "Qualité", value: "quality", order: 2 },
        { label: "Marque", value: "brand", order: 3 },
        { label: "Utilité", value: "utility", order: 4 },
      ],
    },
  ],

  MARKET_RESEARCH: [
    {
      title: "Bonjour 👋 Nous réalisons une courte étude. Quel âge avez-vous ?",
      type: "SINGLE_CHOICE",
      order: 1,
      options: [
        { label: "-18", value: "under_18", order: 1 },
        { label: "18-25", value: "18_25", order: 2 },
        { label: "26-35", value: "26_35", order: 3 },
        { label: "35+", value: "35_plus", order: 4 },
      ],
    },
    {
      title: "Quel est votre principal moyen de transport ?",
      type: "SINGLE_CHOICE",
      order: 2,
      options: [
        { label: "Taxi", value: "taxi", order: 1 },
        { label: "VTC", value: "vtc", order: 2 },
        { label: "Bus", value: "bus", order: 3 },
        { label: "Moto", value: "moto", order: 4 },
      ],
    },
    {
      title: "Seriez-vous intéressé par une nouvelle app de transport ?",
      type: "SINGLE_CHOICE",
      order: 3,
      options: [
        { label: "Oui", value: "yes", order: 1 },
        { label: "Non", value: "no", order: 2 },
        { label: "Peut-être", value: "maybe", order: 3 },
      ],
    },
  ],

  PRODUCT_FEEDBACK: [
    {
      title:
        "Bonjour 👋 Nous aimerions avoir votre avis sur un nouveau produit. Que pensez-vous de ce produit ?",
      type: "SINGLE_CHOICE",
      order: 1,
      options: [
        { label: "J’aime beaucoup", value: "like", order: 1 },
        { label: "Moyen", value: "average", order: 2 },
        { label: "Je n’aime pas", value: "dislike", order: 3 },
      ],
    },
    {
      title: "Qu’est-ce que vous changeriez ?",
      type: "TEXT",
      order: 2,
      placeholder: "Votre réponse...",
    },
  ],

  CUSTOMER_RETENTION: [
    {
      title:
        "Bonjour 👋 Cela fait un moment que vous ne nous avez pas visités. Souhaitez-vous recevoir une offre spéciale ?",
      type: "YES_NO",
      order: 1,
      options: [
        { label: "Oui", value: "yes", order: 1, nextOrder: 2 },
        { label: "Non", value: "no", order: 2 },
      ],
    },
    {
      title: "Quel type d’offre vous intéresse ?",
      type: "SINGLE_CHOICE",
      order: 2,
      options: [
        { label: "Réduction", value: "discount", order: 1 },
        { label: "Cadeau", value: "gift", order: 2 },
        { label: "Livraison gratuite", value: "free_delivery", order: 3 },
      ],
    },
  ],

  NPS: [
    {
      title: "Bonjour 👋 Sur une échelle de 0 à 10, recommanderiez-vous notre service ?",
      type: "RATING",
      order: 1,
      minValue: 0,
      maxValue: 10,
      options: [
        { label: "0", value: "0", order: 1, nextOrder: 2 },
        { label: "1", value: "1", order: 2, nextOrder: 2 },
        { label: "2", value: "2", order: 3, nextOrder: 2 },
        { label: "3", value: "3", order: 4, nextOrder: 2 },
        { label: "4", value: "4", order: 5, nextOrder: 2 },
        { label: "5", value: "5", order: 6, nextOrder: 2 },
        { label: "6", value: "6", order: 7, nextOrder: 2 },
        { label: "7", value: "7", order: 8, nextOrder: 3 },
        { label: "8", value: "8", order: 9, nextOrder: 3 },
        { label: "9", value: "9", order: 10, nextOrder: 3 },
        { label: "10", value: "10", order: 11, nextOrder: 3 },
      ],
    },
    {
      title: "Pouvez-vous nous dire pourquoi ?",
      type: "TEXT",
      order: 2,
      placeholder: "Votre réponse...",
    },
    {
      title: "Merci. Qu’est-ce que vous aimez le plus ?",
      type: "TEXT",
      order: 3,
      placeholder: "Votre réponse...",
    },
  ],

  BUSINESS_IDEA_VALIDATION: [
    {
      title:
        "Bonjour 👋 Seriez-vous intéressé par une application qui permet de [concept] ?",
      type: "SINGLE_CHOICE",
      order: 1,
      options: [
        { label: "Oui", value: "yes", order: 1 },
        { label: "Non", value: "no", order: 2 },
        { label: "Peut-être", value: "maybe", order: 3 },
      ],
    },
    {
      title: "Combien seriez-vous prêt à payer ?",
      type: "SINGLE_CHOICE",
      order: 2,
      options: [
        { label: "Gratuit", value: "free", order: 1 },
        { label: "1 000 - 5 000 FCFA", value: "1000_5000", order: 2 },
        { label: "5 000+ FCFA", value: "5000_plus", order: 3 },
      ],
    },
  ],
} as const;