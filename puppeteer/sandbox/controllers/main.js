
const controller = (req, res, query = {}) => {

    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    res.end(JSON.stringify({
        page: {
            query,
        }
    }));
}

controller.url = '/main';

module.exports = controller;
