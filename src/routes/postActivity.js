const { Router } = require("express");
const { Activity, Country } = require("../db")
const router = Router();

router.post('/', async (req, res) => {
    const { name, difficulty, duration, season, countries } = req.body;
    try {
        if (name && difficulty && duration && season) {
            const activityId = await Activity.create({
                name,
                difficulty,
                duration,
                season
            });

            countries.forEach(async (e) => {
                const countryDb = await Country.findOne({
                    where: {
                        idApi: e,
                    },
                });
                await activityId.addCountry(countryDb);
            });
            res.status(200).json(activityId);
        } else {
            res.send("Faltan parametros para las actividades");
        }
    } catch (error) {
        console.log(error);
    }
});

router.get("/", async (req, res) => {
    let activities = [];
    return Activity.findAll()
        .then((e) => {
            e.forEach((e) => activities.push(e.name));
            res.send(activities);
        })
        .catch((error) => {
            res.status(404).send(error);
        });
});

router.get('/:idActivity', async (req, res) => {
    try {
        const { idActivity } = req.params;
        const activity = await Activity.findByPk(idActivity, {
            include: {
                model: Country,
            }
        });
        res.json(activity ? activity : []);
    } catch (e) {
        res.send(e);
    }
});

module.exports = router;