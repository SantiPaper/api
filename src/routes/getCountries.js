const { Router, response } = require("express");
const axios = require("axios")
const { Country, Activity } = require("../db");
const router = Router();
const { Op } = require("sequelize");


const apiGetData = async () => {
    try {
        const getApi = await axios.get("https://restcountries.com/v3/all");
        const filtredCountriesApi = getApi.data.map(async (e) => {
            try {
                await Country.findOrCreate({
                    where: {
                        idApi: e.cca3,
                    },
                    defaults: {
                        idApi: e.cca3,
                        name: e.translations.spa.common,
                        img: e.flags[1],
                        continent: e.region,
                        capital: e.capital
                            ? e.capital[0]
                            : "Capital not found",
                        subregion: e.subregion,
                        area: e.area,
                        population: e.population,

                    },
                });
                return filtredCountriesApi;
            } catch (error) {
                console.log(error);
            }
        });
    } catch (error) {
        console.log(error);
    }
};

router.get("/", async (req, res) => {

    const { name } = req.query;
    try {
        if (name) {
            const countryName = await Country.findAll({
                where: {
                    name: { [Op.iLike]: `%${name}%` },
                },
                include: Activity,
            });
            if (countryName.length > 0) {
                res.status(200).send(countryName);
            } else {
                res.status(200).send("Country not found");

            }
        } else {
            const countries = await Country.findAll({
                include: [
                    {
                        model: Activity,
                        require: true,

                    },
                ],
            });
            return res.status(200).send(countries);
        }
    } catch (error) {
        /*  console.log(error); */
        return res.status(404).send(error);
    }
});


router.get("/:id", async (req, res) => {

    const { id } = req.params;
    try {
        const idCountry = await Country.findOne({
            where: {
                idApi: id
            },
            include: {
                model: Activity,
            },
        });
        if (!idCountry) {
            res.status(404).send(`El id ingresado no corresponde a ninguno de los paises`)
        } else {
            res.status(200).send(idCountry);
        }
    } catch (error) {
        console.log(error)
        return res.status(404).send(`Pais no encontrado`);
    }
});



module.exports = router;