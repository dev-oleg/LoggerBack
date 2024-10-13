const express = require( 'express' )
const cors = require( 'cors' )
const events = require( 'events' )
const Tail = require( 'tail' ).Tail

const PORT = 5000

const emitter = new events.EventEmitter()

const app = express()

app.use( cors() )
app.use( express.json() )

app.get( '/connect', ( req, res ) => {
  res.writeHead( 200, {
    'Connection': 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache'
  })

  emitter.on( 'newLine', ( data ) => {
    res.write( `data: ${JSON.stringify( data )} \n\n` )
  })
})

app.post( '/tail', ( req, res ) => {
  const { filePath, nLines } = req.body

  try {
    const tail = new Tail( filePath, { nLines } )

    tail.on( 'line', function( data ) {
      emitter.emit( 'newLine', data )
    });

    res.status( 200 ).json( JSON.stringify({}) )
  } catch ( e ) {
    res.status( 400 ).send( 'BadRequest' )
  }
})

app.listen( PORT, () => console.log( `server started on port ${PORT}` ) )
