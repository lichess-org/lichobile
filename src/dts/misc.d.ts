// workaround as typescript standard lib does not support Array.isArray check
// for ReadonlyArray (narrows down to any)
interface ArrayConstructor {
    isArray(arg: ReadonlyArray<any> | any): arg is ReadonlyArray<any>
}
