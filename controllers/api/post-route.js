const router = require('express').Router();
const { Post, User, Comment} = require('../../models');
const sequelize = require('../../config/connection');
const Auth = require('../../utils/auth');

router.get('/', (req, res) => {
    console.log('======================');
    Post.findAll({

      // Query

        attributes: ['id', 
                    'title',
                    'content',
                    'created_at'
                    ],

  order: [['created_at', "DESC"]],
      include: [
          {
              model: Comment,
              attributes: ['id', 'text', 'post_id', 'user_id', 'created_at'],
              include: {
                  model: User,
                  attributes: ['username']
              }
          },
        {
          model: User,
          attributes: ['username']
        }
    ]
    })
        .then(dbPostData => res.json(dbPostData.reverse()))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
            res.status(500).json({ message: "Error" });
        });
  
});

// Single post

router.get('/:id', (req, res) => {
    Post.findOne({
      where: {
        id: req.params.id
      },
      attributes: ['id', 
                   'content',
                   'title',
                   'created_at'
                ],
      include: [
        {
          model: Comment,
          attributes: ['id', 'text', 'post_id', 'user_id', 'created_at'],
          include: {
              model: User,
              attributes: ['username']
          }
      },
      {
          model: User,
          attributes: ['username']
      }
  ]
})

.then(dbPostData => res.json(dbPostData))
.catch(err => {
  console.log(err);
  res.status(500).json({ message: "Error" });
});
});

// creating a post
router.post('/', Auth, (req, res) => {

    // create single post

    Post.create({ 
        title: req.body.title,
        content: req.body.content,
        user_id: req.session.user_id
    })
        .then(dbPostData => res.json(dbPostData))
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: 'Error' });
        });
});



// Updates post title
router.put('/:id', Auth, (req, res) => {
    Post.update({
        title: req.body.title,
        content: req.body.content
      },
      {
        where: {
          id: req.params.id
        }
    }).then(dbPostData => {
        if (!dbPostData) {
            res.status(404).json({ message: 'No post with this ID was found' });
            return;
        }
        res.json(dbPostData);
    })
      .catch(err => {
        console.log(err);
        res.status(500).json({ message: "Error" });
    });
});



// To Delete a post

router.delete('/:id', Auth, (req, res) => {
  console.log(req.params.id, '---------------');
  Post.destroy({
      where: {
          id: req.params.id
      }
  })


  .then(dbPostData => {
      if (!dbPostData) {
          res.status(404).json({ message: "No post with this ID has been found" })
          return;
      }
      res.json(dbPostData);
  })
  .catch(err => {
      console.log(err);
      res.status(500).json({ message: "Error" });
  });
});

module.exports = router;