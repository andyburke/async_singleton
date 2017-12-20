'use strict';

const async_singleton = require( '../index.js' );
const tape = require( 'tape-async' );

tape( 'API', t => {
    t.ok( async_singleton, 'module exports' );
    t.equal( async_singleton && typeof async_singleton.create, 'function', 'exports create()' );
    t.end();
} );

tape( 'synchronous share instance', async t => {
    const foo = {};
    const instance = async_singleton.create( {
        create: () => {
            return foo;
        }
    } );

    const bar = await instance.get();

    t.equal( foo, bar, 'got synchronously generated instance' );
} );

tape( 'asynchronous share instance', async t => {
    const foo = {};
    const instance = async_singleton.create( {
        create: async () => {
            return new Promise( resolve => {
                setTimeout( resolve.bind( null, foo ), 1000 );
            } );
        }
    } );

    const bar = await instance.get();

    t.equal( foo, bar, 'got asynchronously generated instance' );
} );

tape( 'asynchronous gated share instance', async t => {
    const foo = {};
    let creation_count = 0;
    const instance = async_singleton.create( {
        create: async () => {
            ++creation_count;
            return new Promise( resolve => {
                setTimeout( resolve.bind( null, foo ), 1000 );
            } );
        }
    } );

    instance.get();
    instance.get();
    instance.get();

    const bar = await instance.get();

    t.equal( foo, bar, 'got asynchronously generated instance' );
    t.equal( creation_count, 1, 'instance only created once' );
} );

tape( 'asynchronous timeout share instance', async t => {
    const foo = {};
    const instance = async_singleton.create( {
        timeout: 1000,
        create: async () => {
            return new Promise( resolve => {
                setTimeout( resolve.bind( null, foo ), 2000 );
            } );
        }
    } );

    try {
        instance.get();
        await instance.get(); // should time out
    }
    catch( ex ) {
        t.equal( ex, 'timed out', 'timed out creating instance' );
    }
} );