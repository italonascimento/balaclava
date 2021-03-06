const router = require('express').Router()
const models = require('../bookshelf/models')
const sendJSON = require('../utils/sendJSON')
const slugify = require('../utils/slugify')

router.get('/:id?', (req, res, next) => {
  const id = req.params.id
  const query = id ? {id: id} : {}

  models.Collection.forge()
    .where(query)
    .fetchAll()
    .then(collection => {
      const result = id ? collection.at(0) : collection

      sendJSON(res, {
        type: 'collections',
        data: result.toJSON()
      })
    })
    .catch(err => {
      next(err)
    })
})

router.post('/', (req, res, next) => {
  const collection = {
    name: req.body.name,
    slug: slugify(req.body.slug || req.body.name),
    type_id: req.body.type
  }

  models.Type.forge()
    .where({id: collection['type_id']})
    .count('id')
    .then(count => {
      console.log('count: ', count)
      if (count > 0) {
        models.Collection.forge(collection)
          .save()
          .then(model => {
            sendJSON(res, {
              type: 'collection',
              data: model.toJSON()
            })
          })
          .catch(err => next(err))
      } else {
        const err = new Error('Informed Type doesn\'t exist')
        err.status = 400
        next(err)
      }
    })
    .catch(err => {
      next(err)
    })
})

module.exports = router
