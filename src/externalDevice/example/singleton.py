def singleton(cls):
    __instances = {}

    def get_instance(*args, **kwargs):
        if cls not in __instances:
            __instances[cls] = cls(*args, **kwargs)
        return __instances[cls]

    return get_instance
