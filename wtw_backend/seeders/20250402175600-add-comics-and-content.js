'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add seed commands here.
         *
         * Example:
         * await queryInterface.bulkInsert('People', [{
         *   name: 'John Doe',
         *   isBetaMember: false
         * }], {});
        */
        const comicData = [];
        const comicContentData = [];
        const audioFilesDuration = [1, 2, 1, 3, 2, 2, 1, 11, 10, 10, 6, 6, 7, 6];
        let j = 1;
        for (let i = 1; i <= 30; i++) {
            if (j > 15) j = 1;
            comicData.push({
                id: i,
                comicName: `Comic ${i}`,
                description: `My new Comic ${i} description`,
                genreId: ((i >= 15) ? (j++) : (i)),
                createdBy: 1,
                updatedBy: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            for (let k = 1; k <= 14; k++) {
                comicContentData.push({
                    comicId: i,
                    imageFileName: `${k}.png`,
                    audioFileName: `${k}.wav`,
                    length: audioFilesDuration[k] ? audioFilesDuration[k] : 0,
                    sceneNumber: k,
                    createdBy: 1,
                    updatedBy: 1,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }
        return queryInterface.bulkInsert('comics', comicData)
            .then(() => {
                return queryInterface.bulkInsert('comic_content_maps', comicContentData);
            })
            .catch((error) => console.error(error));
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
        await queryInterface.bulkDelete('comic_content_maps', { [Sequelize.Op.or]: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }, { id: 10 }, { id: 11 }, { id: 12 }, { id: 13 }, { id: 14 }, { id: 15 }] });
        await queryInterface.bulkDelete('comics', { [Sequelize.Op.or]: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }, { id: 10 }, { id: 11 }, { id: 12 }, { id: 13 }, { id: 14 }, { id: 15 }] });

    }
};
