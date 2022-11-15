# External device
This feature opens lichess to external devices like electronic boards and others.
Device has to implement one of most common chess protocols via some medium (bluetooth for now)
to use this facility.

## Bluetooth LE implementation
Each device should advertise on predefined uuid of service. Each service contains two string stream characteristics: rx and tx.\
Remark: Bluetooth LE in android requires localization in case of search new device.

Designations for examples:\
`->` - send to device\
`<-` - recive from device

## Protocols
### Chess Engine Communication Protocol (CECP/XBoard/WinBoard)
Advertises on uuids:
````
service: f5351050-b2c9-11ec-a0c0-b3bc53b08d33
tx characteristic: f53513ca-b2c9-11ec-a0c1-639b8957db99
rx characteristic: f535147e-b2c9-11ec-a0c2-8bbd706ec4e6
````
Remembering of board state is required.\
Advantages: rich functionality and low link load\
Disadvantages: large number of commands

Example:
```
-> xboard
-> protover 2
<- feature setboard=1
-> accepted setboard
-> new
-> setboard rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w
-> go
<- move a2a3
-> a7a6
```

Implementation is fully compatible with official CECP if device sends correct moves.\
When user performs `a2a3` move from screen:
```
-> go
-> force
-> a2a3
-> a7a6
-> go
```
When over the board round then `go` will be sent each time after device move:
```
-> go
<- move a2a3
-> go
<- move a7a6
```
When device sends move without promotion then promotion popup is shown:
```
-> go
<- move a7a8
-> Illegal move (without promotion): a7a8
-> force
-> a7a8q
-> b2b1
-> go
```
When device sends incorect move:
```
-> go
<- move a1f3
-> Illegal move: a1f3
```

Device example:\
Run [run.py](./example/run.py) with `--protocol=cecp`\
Links:\
http://hgm.nubati.net/CECP.html \
https://www.gnu.org/software/xboard/engine-intf.html

### Universal Chess Interface (UCI)
Advertises on uuids:
````
service: f535151e-b2c9-11ec-a0c3-1f8edc817d5a
tx characteristic: f53515fa-b2c9-11ec-a0c4-5fae981f8945
rx characteristic: f53516fe-b2c9-11ec-a0c5-a792c62e5941
````
Stateless protocol. In opposite to CECP remembering of the board state isn't required. Before each move whole board state is transferred.\
Advantages: simple and most popular\
Disadvantages: poor functionality and higher link load because redundant information

Example:
```
-> uci
<- uciok
-> isready
<- readyok
-> ucinewgame
-> position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w
-> go infinite
<- bestmove a2a3
-> position fen rnbqkbnr/1ppppppp/p7/8/8/P7/1PPPPPPP/RNBQKBNR w
-> go infinite
```

When user performs move from screen:
```
-> go infinite
-> stop
<- bestmove <any> % will be ignored
-> position fen rnbqkbnr/1ppppppp/p7/8/8/P7/1PPPPPPP/RNBQKBNR w
-> go infinite
```

Device example:\
Run [run.py](./example/run.py) with `--protocol=uci`\
Links:\
http://wbec-ridderkerk.nl/html/UCIProtocol.html