const express = require(`express`);
const app = express();
const {
  syncAndSeed,
  models: { People, Places, Things, Souvenir },
} = require(`./db`);

app.use(express.urlencoded({ extended: false }));

app.use(require(`method-override`)(`_method`));

app.post(`/`, async (req, res, next) => {
  try {
    await Souvenir.create(req.body);
    res.redirect(`/`);
  } catch (err) {
    next(err);
  }
});

app.delete(`/:id`, async (req, res, next) => {
  try {
    const souvenir = await Souvenir.findByPk(req.params.id);
    await souvenir.destroy();

    res.redirect(`/`);
  } catch (err) {
    next(err);
  }
});

app.get(`/`, async (req, res, next) => {
  try {
    const [people, places, things, souvenirs] = await Promise.all([
      People.findAll(),
      Places.findAll(),
      Things.findAll({
        include: [Souvenir],
      }),
      Souvenir.findAll({
        include: [People, Places, Things],
      }),
    ]);

    const html = `
    <html>
      <head>
        <title>Acme People, Places & Things</title>
      </head>
      <body>
        <h1>Acme People, Places & Things</h1>
        <div>
          <ul>
            ${people
              .map(
                (person) => `
            <li>${person.name}</li>
            `
              )
              .join("")}
          </ul>
        </div>
        <div>
          <ul>
            ${places
              .map(
                (place) => `
            <li>${place.name}</li>
            `
              )
              .join("")}
          </ul>
        </div>
        <div>
          <ul>
            ${things
              .map(
                (thing) => `
            <li>${thing.name}
              <ul>    
              ${thing.souvenirs
                .map(
                  (souvenir) => `
              <li>This souvenir was purchased on ${souvenir.purchasedOn}.</li>
              <li>This number of times this souvenir has been purchased is ${souvenir.count}.</li>
                `
                )
                .join("")}
                
              </ul>
            </li>
            `
              )
              .join("")}
          </ul>
        </div>

        <form method='POST'>
            <select name='personId'>
              ${people
                .map((person) => {
                  return `
                    <option value=${person.id}>
                      ${person.name}
                    </option>
                  `;
                })
                .join("")}
            </select>
            <select name='placeId'>
              ${places
                .map((place) => {
                  return `
                    <option value=${place.id}>
                      ${place.name}
                    </option>
                  `;
                })
                .join("")}
            </select>
            <select name='thingId'>
              ${things
                .map((thing) => {
                  return `
                    <option value=${thing.id}>
                      ${thing.name}
                    </option>
                  `;
                })
                .join("")}
            </select>
            <button>Create</button>
          </form>

          
        <div>
          <ul>
            ${souvenirs
              .map(
                (souvenir) => `
            <li>${souvenir.person.name} purchased a ${souvenir.thing.name} in ${souvenir.place.name}</li>
            <form method='POST' action='/${souvenir.id}?_method=DELETE'>
                <button>
                x 
                </button>
              </form>
            `
              )
              .join("")}
          </ul>   
        </div>
        
      </body>
    </html>`;

    res.send(html);
  } catch (err) {
    next(err);
  }
});

const init = async () => {
  try {
    await syncAndSeed();
    const port = process.env.PORT || 1111;
    app.listen(port, () => {
      console.log(`listening to port ${port}`);
    });
  } catch (err) {
    console.log(err);
  }
};

init();
