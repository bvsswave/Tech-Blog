const router = require('express').Router();
const { Post, User, Comment} = require('../../models');
const sequelize = require('../../config/connection');
const withAuth = require('../../utils/auth');

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
      .then(dbPostData => {
        if (!dbPostData) {
          res.status(404).json({ message: 'Not a post was found with this ID' });
          return;
        }
        res.json(dbPostData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ message: "Error" });
      });
  });

// creating a post
router.post('/', withAuth, (req, res) => {

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



// Updates the post title

router.put('/:id', withAuth, (req, res) => {
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
            res.status(404).json({ message: 'No post found with this id' });
            return;
        }
        res.json(dbPostData);
    })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});



// delete a post 
router.delete('/:id', withAuth, (req, res) => {
    Post.destroy({
        where: {
            id: req.params.id 
        }
    }).then(dbPostData => {
        if (!dbPostData) {
            res.status(404).json({ message: 'No post found with this id' });
            return;
        }
        res.json(dbPostData);
    }).catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

module.exports = router;