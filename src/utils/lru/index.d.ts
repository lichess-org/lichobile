// Copyright (c) 2010-2016 Rasmus Andersson https://rsms.me/
// taken from https://github.com/rsms/js-lru

export default class LRUMap<K,V> {
  // Construct a new cache object which will hold up to limit entries.
  // When the size == limit, a `put` operation will evict the oldest entry.
  //
  // If `entries` is provided, all entries are added to the new map.
  // `entries` should be an Array or other iterable object whose elements are
  // key-value pairs (2-element Arrays). Each key-value pair is added to the new Map.
  // null is treated as undefined.
  constructor(limit :number, entries? :Iterable<[K,V]>);

  // Convenience constructor equivalent to `new LRUMap(count(entries), entries)`
  constructor(entries :Iterable<[K,V]>);

  // Current number of items
  size :number;

  // Maximum number of items this map can hold
  limit :number;

  // Least recently-used entry. Invalidated when map is modified.
  oldest :Entry<K,V>;

  // Most recently-used entry. Invalidated when map is modified.
  newest :Entry<K,V>;

  // Replace all values in this map with key-value pairs (2-element Arrays) from
  // provided iterable.
  assign(entries :Iterable<[K,V]>) : void;

  // Put <value> into the cache associated with <key>. Replaces any existing entry
  // with the same key. Returns `this`.
  set(key :K, value :V) : LRUMap<K,V>;

  // Purge the least recently used (oldest) entry from the cache.
  // Returns the removed entry or undefined if the cache was empty.
  shift() : [K,V] | undefined;

  // Get and register recent use of <key>.
  // Returns the value associated with <key> or undefined if not in cache.
  get(key :K) : V | undefined;

  // Returns an object suitable for JSON encoding
  toJSON() : ReadonlyArray<[K, V]>;
}

// An entry holds the key and value, and pointers to any older and newer entries.
interface Entry<K,V> {
  key   :K;
  value :V;
}
