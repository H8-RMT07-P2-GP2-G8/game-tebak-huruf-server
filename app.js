const app = require('express')();
const router = require('express').Router();
router.get('/', (req, res) => {
  res.send('welcome to game tebak huruf server')
})
app.use(router)
const server = require('http').Server(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 3000

let players = []
const started = false

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit('connect')

  socket.on('getPlayers', payload => {
    io.emit('getPlayers', players)
  })

  socket.on('join', (payload) => {
    let isTaken = false
    players.forEach(e => {
      if(e.name === payload.name) isTaken = true
    })
    if(!isTaken){
      players.push(payload)
      io.emit('getPlayers', players)
      socket.emit('notTaken')
    } else {
      socket.emit('hasTaken')
    }
    // if(players.length == 2) { // mulai game kalau player sudah 2 orang
      // io.emit('getReady')
    //   sleep(5000) // kasi delay sebelum mulai game
    //   io.emit('start')
    // }
  })

  socket.on('cekPlayer', (payload) => {
    let isPlayer = false
    players.forEach(e => {
      if(e.name === payload) isPlayer = true
    })
    if (!isPlayer) socket.emit('notPlayer')
  })

  socket.on('triggerStart', payload => {
    sleep(1) // kasi delay sebelum mulai game
    io.emit('getReady')
    sleep(5000) // kasi delay sebelum mulai game
    io.emit('start')
  })

  socket.on('tambah', name => { // untuk nambah score
    players.map(e => {
      if(e.name === name) e.score++
      if(e.score === 10){
        io.emit('end', {winner: e.name}) // kirim pemenang kalau score sudah 10
        players = [] // reset players kalau game selesai
      } 
    })
    io.emit('getPlayers', players) //ngirim const players ke server
  })
});

server.listen(PORT, () => {
  console.log(`listening on port: ${PORT}`);
});