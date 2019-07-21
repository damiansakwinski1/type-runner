const createMessage = (target, type, payload) => ({
  target,
  type,
  payload
})

module.exports = {
  singleTargetMessage: (target, type, payload) => createMessage([target], type, payload),
  multiTargetMessage: createMessage
}