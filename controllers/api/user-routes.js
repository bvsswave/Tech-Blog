const router = require('express').Router();
const { Post, User, Comment } = require('../models');
// const Auth = require('../utils/auth');

router.get('/', (req, res) => {
    User.findAll({
        attributes: { exclude: ['password'] } 
    })
    .then(dbUserData => res.json(dbUserData))
    .catch(err => {
        console.log(err);
        res.status(500).json({ message: 'Error' });
    });
});



// GET id from users

router.get('/:id', (req, res) => {
    User.findOne({
        attributes: { exclude: ['password'] },
        where: {
          id: req.params.id
        },
        include: [
          {
            model: Post,
            attributes: [
                'id', 
                'title', 
                'content', 
                'created_at']
          },
          // Comment Model
          {
            model: Comment,
            attributes: ['id', 'text', 'created_at'],
            include: {
              model: Post,
              attributes: ['title']
            }
        }
      ]
    
  })
    //       {
    //         model: Post,
    //         attributes: ['title'],
    //       }
    //     ]
    //   })

      .then(dbUserData => {
        if (!dbUserData) {
          res.status(404).json({ message: 'No user with this ID was found' });
          return;
        }
        res.json(dbUserData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ message: 'Error' });
      });
});

// Adds user

router.post('/', (req, res) => {
    console.log(req.body)
      // expects {username: 'Bvsswave', email: 'tannershahan@gmail.com', 'password: 'password1234'}
      User.create({
          username: req.body.username,
          email: req.body.email,
          password: req.body.password
      })
      .then(dbUserData => {
        req.session.save(() => {
          req.session.user_id = dbUserData.id;
          req.session.username = dbUserData.username;
          req.session.loggedIn = true;
          res.json(dbUserData);
        });
      })
      .catch(err => {
          console.log(err);
          res.status(500).json({ message: 'Error' });
      });

    });
    //login route
    router.post('/login', (req, res) => {
        // expects {username: 'username', password: 'password1234'}
        User.findOne({
          where: {
            username: req.body.username
        }
    }).then(dbUserData => {
        if (!dbUserData) {
          res.status(400).json({ message: 'There is no user with that username' });
          return;
        }
        const validPassword = dbUserData.checkPassword(req.body.password);
        if (!validPassword) {
          res.status(400).json({ message: 'Password is Incorrect!' });
          return;
        }
        req.session.save(() => {
          req.session.user_id = dbUserData.id;
          req.session.username = dbUserData.username;
          req.session.loggedIn = true;
  
          res.json({ user: dbUserData, message: "Yay! You're logged in!" });
        });
        
      });
    }); 
// POST to identify users 
router.post('/login', (req, res) => {
    // expects {username: 'lernantino', password: 'password1234'}
    User.findOne({
        where: {
            username: req.body.username
        }
    }).then(dbUserData => {
        if (!dbUserData) {
            res.status(400).json({ message: 'No user with that username!'});
            return;
        }
        // res.json({ user: dbUserData});
        // verify user
        const validPassword = dbUserData.checkPassword(req.body.password);

        if (!validPassword) {
            res.status(400).json({ message: 'Incorrect password!' });
            return;
        }
        req.session.save(() => {
            // declare session variables
            req.session.user_id = dbUserData.id;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;
      
            res.json({ user: dbUserData, message: 'You are now logged in!' });
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
});


// users to log out 
router.post('/logout', (req, res) => {
    if (req.session.loggedIn) {
        req.session.destroy(() => {
            res.status(204).end();
        });
    } else {
        res.status(404).end();
    }
});

// PUT /api/users/1 - similar to UPDATE 
router.put('/:id', (req, res) => {
    // if req.body has exact key/value pairs to match the model, you can just use `req.body` instead

    User.update(req.body, {
        individualHooks: true,
        where: {
            id: req.params.id
        }
    })
    .then(dbUserData => {
        if (!dbUserData[0]) {
            res.status(404).json({ message: 'No user found with this id'});
            return;
        }
        res.json(dbUserData);
    })
    .catch(err => {
        console.log(err); 
        res.status(500).json(err);
    });

});

// DELETE /api/users/1
router.delete('/:id', (req, res) => {
    User.destroy({
        where: {
            id: req.params.id
        }
    })
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(404).json({ message: 'No user found with this id'});
                return;
            }
            res.json(dbUserData);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});




module.exports = router;