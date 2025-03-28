'use strict';

class AccessController {
    signUp = async (req, res, next) => {
        try {
            const { name, email, password } = req.body;
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new AccessController();
