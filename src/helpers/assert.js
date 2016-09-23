  function __assert (condition, msg) {
    if (!condition) {
      throw new Error(msg);
    }
  }

  function __assertFunction (param) {
    __assert(isFunction(param), 'Parameter must be function!')
  }

  function __assertArray (param) {
    __assert(isArray(param), 'Parameter must be array!')
  }

  function __assertNotEmpty (coll) {
    __assert(!isEmpty(coll), 'Sequence is empty')
  }

  function __assertIterable (obj) {
    __assert(isIterable(obj), 'Parameter must be iterable!')
  }

  function __assertCollection (obj) {
    __assert(isCollection(obj), 'Pa>rameter must be collection!')
  }

  function __assertIterationNotStarted (collection) {
    let iterationStarted = ('StartedIterating' in collection) && collection.StartedIterating();
    __assert(!iterationStarted, 'Iteration already started!')
  }

  function __assertString (obj) {
    __assert(isString(obj), 'Parameter must be string!')
  }

  function __assertIndexInRange(coll, index) {
    __assertCollection(coll)
    __assert(isNumeric(index), 'Index must be number!')
    __assert(index >= 0 && index < coll.Count(), 'Index is out of bounds')
  }
