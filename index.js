'use strict';

module.exports = {
    create: ( {
        create = () => {},
        instance = null,
        timeout = 0,
        interval = 100
    } = {} ) => ( {
        create,
        instance,
        timeout,
        interval,
        get: async function() {

            if ( this.instance ) {
                return this.instance;
            }

            if ( this._creating ) {
                const ending_time = this.timeout ? ( +new Date() + this.timeout ) : 0;

                const check = ( resolve, reject ) => {
                    if ( !this._creating ) {
                        resolve( this.instance );
                    }
                    else if ( ending_time ) {
                        if ( +new Date() < ending_time ) {
                            setTimeout( check, this.interval, resolve, reject );
                        }
                        else {
                            reject( 'timed out' );
                        }
                    }
                    else {
                        setTimeout( check, this.interval, resolve, reject );
                    }
                };

                return new Promise( check );
            }

            this._creating = true;
            this.instance = await this.create();
            this._creating = false;

            return this.instance;
        }
    } )
};