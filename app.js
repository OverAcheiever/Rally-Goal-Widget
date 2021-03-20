var progress = {
    percent: 0,
    usd: 0,
  };
  let goal = {goal};	
  let usd = 0;
  
  var progressBar = new ProgressBar.Circle("#progress", {
      color: "{barColor}",
      strokeWidth: 50,
      duration: 2000, // milliseconds
      easing: "easeInOut",
    });
  
  function updateBar(percent, usd) {
    
    if(percent <= 100){
      per = percent / 100
      progressBar.animate(per); // percent
      
      anime({
      targets: progress,
      percent: percent,
        usd: usd,
      cycles: 130,
      round: 1,
      easing: "linear",
      duration: 2000,
      update: function () {
        document.querySelector(".percent").innerHTML = JSON.stringify(
          progress.percent
        );
        document.querySelector(".goalAmount").innerHTML = `$${JSON.stringify(progress.usd)} / ${goal}`
      }
    });
    }
    else{
            progressBar.animate(1); // percent
      
      anime({
      targets: progress,
      percent: percent,
        usd: usd,
      round: 1,
      easing: "linear",
      duration: 2000,
      update: function () {
        document.querySelector(".percent").innerHTML = JSON.stringify(
          progress.percent
        );
         document.querySelector(".goalAmount").innerHTML = `$${JSON.stringify(progress.usd)} / ${goal}`
      },
    });
    }
        SE_API.store.set('rallygoalbar', {usd:usd}).then(res => {
          if (res.message.startsWith('success')) console.log('Sucessfully Saved to Cloud')
          else throw new Error(res.message);
        }).catch((e) => {
          console.log('Error saving Database!', e);
         // reject('Error saving Database!');
        });
    
  }
  
  const socket = new WebSocket(
    "wss://rally-alerts-server.herokuapp.com/rally/alerts/websocket"
  );
  
  function isOpen(ws) {
                  return ws.readyState === ws.OPEN;
              }
              setInterval(function () {
                  if (!isOpen(socket)) {
                      console.log("Reconnecting")
                      location.reload();
                      new WebSocket(
                          "wss://rally-alerts-server.herokuapp.com/rally/alerts/websocket"
                      );
                  }
                  else {
                      socket.send("Keep Alive");
                  }
              }, 5000);
  
  
  socket.addEventListener("message", (event) => {
      socket.send('Received!')
      if (event.data.slice(0, 1) !== "{") {
        console.log("SERVER: ", event.data);
      } else {
        console.log("Donation Receieved");
        if (JSON.parse(event.data).coinKind == '{creatorCoin}') {
          console.log(JSON.parse(event.data))
          usd += JSON.parse(event.data).data.costInUSCents/100;
          updateBar((usd /goal) * 100, usd)
      }
      }
    });
  
  window.addEventListener('onEventReceived', function (obj) {
     if(obj.detail.event.field == "reset"){
         usd = 0;
       progress.percent = 0;
       updateBar(0, 0);
     }
  });
  
  window.addEventListener('onWidgetLoad', function (obj) {
     SE_API.store.get('rallygoalbar').then(p => {
      usd = p.usd;
      updateBar((p.usd / goal) * 100, usd);
  });
  });
  
  