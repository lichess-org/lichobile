var test = require('tape');

test('__END__', function (t) {
    t.end();
    process.exit(0);
});
