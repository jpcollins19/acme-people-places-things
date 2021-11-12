const Sequelize = require(`sequelize`);
const { STRING } = Sequelize;

const db = new Sequelize(
  process.env.DATABASE_URL || `postgres://localhost/acme_people_places_things`
);

const People = db.define(`people`, {
  name: {
    type: STRING,
  },
});

const Places = db.define(`places`, {
  name: {
    type: STRING,
  },
});

const Things = db.define(`things`, {
  name: {
    type: STRING,
  },
});

const Souvenir = db.define(`souvenirs`, {
  count: {
    type: STRING,
  },
  purchasedOn: {
    type: STRING,
  },
});

Souvenir.beforeSave((souvenir) => {
  souvenir.count = 1;
  souvenir.purchasedOn = new Date();
});

Souvenir.belongsTo(People);
Souvenir.belongsTo(Places);
Souvenir.belongsTo(Things);
Things.hasMany(Souvenir);

const data = {
  people: ["moe", "larry", "lucy", "ethyl"],
  places: ["paris", "nyc", "chicago", "london"],
  things: ["foo", "bar", "bazz", "quq"],
};

const syncAndSeed = async () => {
  try {
    await db.sync({ force: true });

    const [moe, larry, lucy, ethyl] = await Promise.all(
      data.people.map((name) => People.create({ name }))
    );

    const [paris, nyc, chicago, london] = await Promise.all(
      data.places.map((name) => Places.create({ name }))
    );

    const [foo, bar, bazz, quq] = await Promise.all(
      data.things.map((name) => Things.create({ name }))
    );

    await Souvenir.create({
      personId: moe.id,
      thingId: foo.id,
      placeId: london.id,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  syncAndSeed,
  models: { People, Places, Things, Souvenir },
};
