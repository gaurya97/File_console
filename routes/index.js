var express = require('express');
var router = express.Router();
const dbconnect =require('./dbconfig');
const {initializePassport,isAthonticated} =require('./passport');
const passport = require('passport');
const multer =require('multer');
const csvparser =require('json2csv').Parser;
const EventEmitter =require('events');
const event = new EventEmitter();



const storage = multer.diskStorage({
  destination:(req,file,cb)=> {
 return cb(null,"./public/uploads")
  },
  filename:(req,file,cb)=> {
    return cb(null,`${req.body.pdfname}.pdf`)
  }
})
const upload=multer({storage})

/* GET home page. */
initializePassport(passport)

router.use((req,res,next)=>{
  // req.session.startTime = new Date();
  const now = new Date()
  const year= String(now.getFullYear()).padStart(2,'0');
  const month= String(now.getMonth()+1).padStart(2,'0');
  const day= String(now.getDate()).padStart(2,'0');
const hr = String(now.getHours()).padStart(2,'0');
const min = String(now.getMinutes()).padStart(2,'0');
const sec = String(now.getSeconds()).padStart(2,'0');
req.session.currentTime ={
  time: `${hr}:${min}:${sec}`,
  date:`${year}-${month}-${day}`
} 
  next()
});

const isadminauthonticate = (req, res, next) => {
  if (req.user) {
    if (req.user[0].user_role !== "Agent") {
      return next();
    } else {
      res.redirect("/login");
    }
  } else {
    return next();
  }
};



const isadminlogout = (req,res,next)=>{
  if(req.user){
    dbconnect.query(`select user_login_id from user_sessions where  session_end_time is null `,(err,results)=>{
      if(err){
        console.log(err);
      }
      else{
        const c1 =JSON.stringify(results);
        const currentLoginUsers =JSON.parse(c1);
        console.log(currentLoginUsers);
       const logoutuser = currentLoginUsers.find( e => e.user_login_id ===req.user[0].user_id)
          if(logoutuser){
            return next()
          }
          else if(req.user && !logoutuser && !req.session.visitedprofile){
            return next()
          }
         else{
          req.session.destroy((err)=>{
            if(err) console.log(err)
            console.log(req.session);
            res.redirect('/login')
          })
         }
         
      
      }
    })

  }
  else{
    return next()
  }
   
}



router.get('/uploads',isAthonticated,isadminauthonticate,(req,res,next)=>{
    res.render('upload',{
      message:req.flash('upload')
    })
})

router.post('/uploads',upload.single("file"),(req,res,next)=>{
  console.log(req.body)
  console.log(req.file)
  dbconnect.query(`insert into scripts (filename,filepath) values('${req.body.pdfname}','${req.file.destination}/${req.file.filename}')`,(err,results)=>{
    if(err){
      console.log(err)

    }
    else{
      req.flash('upload','File Uploaded Succefully');
      res.redirect('/uploads');
    }

  });
  
  
})


// router.get('/user',  function(req, res, next) {
// dbconnect.query(`select * from users`,(err,results)=>{
//     if(err) res.send(err)
//     const user = results.map((e)=>{
//     return e;
//     })
//     res.send(user);
//   })
 
//   dbconnect.query('SELECT * FROM users', (error, results,fields) => {
//     if (error) {
//       console.error('Error executing query:', error);
//       res.status(500).send('Error retrieving users');
//       return;
//     }
//     // const data = JSON.stringify(results);
//     const newdata = results.map((e)=>{
//   return e.username;
//     })
    
//     // res.send(user)
//     // console.log(fields)
//   });
// });

router.get('/register',isAthonticated,isadminauthonticate,(req,res)=>{
  res.render('register',{
    register:req.flash('register')
  })
  console.log(req.flash('register'))
})
router.post('/register', async (req,res)=>{
  try {
    dbconnect.query(
      `insert into users (user_name,user_id,user_role,password) values('${req.body.username}','${req.body.userid}','${req.body.role}','${req.body.password}')`,(err,results)=>{
        if(err){
          console.log(err)
        }
        else{
          req.flash('register','User Registered Succefully');
          res.redirect('/register');
        }
      }
    );
    console.log(req.flash('register'));
     


  } catch (error) {
    res.send(error)
  }
  
})

router.get('/login',(req,res)=>{
  console.log(req.flash('log_error'));
  res.render('login',{
    err:req.flash('error')
  })
})
router.get('/profile',isadminlogout,isAthonticated,(req,res)=>{
  // console.log(req.session.startTime);
  // console.log(req.session.startTime.time);
  // console.log(req.session.startTime.date);
  // if( !req.session.refresh){
  //   req.session.refresh=1
  // }
  // else{
  //   req.session.refresh +=1
  //   console.log(`refresh count : ${req.session.refresh}`);
  //   res.redirect('/login')
  // }

  
console.log(req.session.passport.user);
console.log(req.user[0].id);
req.session.visitedprofile=true;
  
try {
    dbconnect.query(`SELECT * FROM user_sessions where user_name = '${req.user[0].user_name}' order by id desc limit 1`,(err,results)=>{
      let idl='idle'
      if(err){
          console.log(err)
        }
    
        else{
          if(results==0 || results[0].session_end_time !== null ){
            dbconnect.query(`insert into user_sessions (user_name,user_login_id,user_id,agent_status,session_start_date,session_start_time) values('${req.user[0].user_name}','${req.user[0].user_id}',
            '${req.user[0].id}','${idl}','${req.session.currentTime.date}',
            '${req.session.currentTime.time}')`)
          }
        }
    })

    //  dbconnect.query(`insert into user_sessions (user_name,user_id,session_start_date,session_start_time) values('${req.user[0].user_name}','${req.user[0].id}','${req.session.currentTime.date}',
    //  '${req.session.currentTime.time}')`)

     dbconnect.query(`select id,filename ,filepath from scripts`,(error,results,fields)=>{
      if(error){
        console.log(error)
      }
      else{
        const rows =JSON.stringify(results);
        console.log(rows)
        const pdfdata=JSON.parse(rows)
        res.render('profile',{
          user:req.user[0].user_name,
          userId:req.user[0].user_id,
          Role: req.user[0].user_role,
          pdfdata:pdfdata
        
        })
      }
     });
  } catch (error) {
    res.send(error)
  }
 
}
)


router.post('/login',passport.authenticate('local',{
  successRedirect:'/profile',
  failureRedirect:'/login',
  failureFlash:true
}),(req,res,next)=>{
    
});

router.post('/logout',(req,res,next)=>{
  // console.log(req.session)
  // console.log(req.sessionID)
  // console.log(req.session.username)
  // console.log(req.session.currentTime.date)
  // console.log(req.session.currentTime.time)
  console.log(req.user[0].user_name)
  if(req.user){
    dbconnect.query(`SELECT * FROM user_sessions where user_name = '${req.user[0].user_name}' order by id desc limit 1`, (error, results,fields)=>{
      if(error){
        console.log(error)
      }
      else{
        if(results[0].user_id == req.session.passport.user){

          priviousSessionId = results[0].id;
        // console.log(results.length);
        // console.log(priviousSessionId);
        dbconnect.query(`update user_sessions 
           set session_end_date = '${req.session.currentTime.date}',
           session_end_time = '${req.session.currentTime.time}',
           logout_status='Agent logout' 
          where id =${priviousSessionId}`,(error,results)=>{
            if(error){
              console.log(error)
            }
            else{
              req.session.destroy((err)=>{
                             if(err) console.log(err)
                             console.log('session end time updated and desroyed the session');
                             console.log(req.session);
                             res.redirect('/login')
                           }) 
              // req.logOut();
              // res.redirect('/login')
            }
          })
         

        }
        
      }
      
          
  }
  )


  }
  else{
    next()
  }
  

  
  
    
  
  


  // dbconnect.query(`update user_sessions 
  //     set session_end_date = '${req.session.currentTime.date}',
  //     session_end_time = '${req.session.currentTime.time}' 
  //     where user_name = '${req.user[0].user_name}' and session_end_time is null  `,(error,results,fields)=>{
  //       if(error){
  //         console.log(error)
  //       }
  //       else{
  //            req.session.destroy((err)=>{
  //              if(err) console.log(err)
  //              console.log('session end time updated and desroyed the session');
  //              console.log(req.session);
  //              res.redirect('/login')
  //            })    
  //          }
  
  //     }) //update end session time

}
);

router.post('/forcelogout',(req,res)=>{
  console.log(req.session)
  console.log(req.sessionID)
  console.log(req.session.username)
  console.log(req.session.currentTime.date)
  console.log(req.session.currentTime.time)
  console.log(req.user[0].user_name)

  
  
    dbconnect.query(`SELECT * FROM user_sessions where user_name = '${req.user[0].user_name}' order by id desc limit 1`, (error, results,fields)=>{
      if(error){
        console.log(error)
      }
      else{
        if(results[0].user_id == req.session.passport.user){

          priviousSessionId = results[0].id;
        console.log(results.length);
        console.log(priviousSessionId);
        dbconnect.query(`update user_sessions 
           set session_end_date = '${req.session.currentTime.date}',
           session_end_time = '${req.session.currentTime.time}',
           logout_status='Auto logout' 
          where id =${priviousSessionId}`,(error,results)=>{
            if(error){
              console.log(error)
            }
            else{
              req.session.destroy((err)=>{
                             if(err) console.log(err)
                             console.log('session end time updated and desroyed the session');
                             console.log(req.session);
                             res.redirect('/login')
                           }) 
              // req.logOut();
              // res.redirect('/login')
            }
          })
         

        }
        
      }
      
          
  }
  )
  
  


  // dbconnect.query(`update user_sessions 
  //     set session_end_date = '${req.session.currentTime.date}',
  //     session_end_time = '${req.session.currentTime.time}' 
  //     where user_name = '${req.user[0].user_name}' and session_end_time is null  `,(error,results,fields)=>{
  //       if(error){
  //         console.log(error)
  //       }
  //       else{
  //            req.session.destroy((err)=>{
  //              if(err) console.log(err)
  //              console.log('session end time updated and desroyed the session');
  //              console.log(req.session);
  //              res.redirect('/login')
  //            })    
  //          }
  
  //     }) //update end session time

}
);

router.get('/adminlogout',isAthonticated,isadminauthonticate,(req,res,next)=>{
    dbconnect.query(`select id, user_name ,user_login_id,session_start_time from user_sessions where session_end_time is null`,(err,results)=>{
      if(err){
        console.log(err)
      }
      else{
        const u1 =JSON.stringify(results);
        const loginUser =JSON.parse(u1);
        res.render('loginpanal',{loginUser})

      }
    })
    



});

router.get('/userlogupdate',(req,res)=>{

  res.setHeader('Content-Type','text/event-stream');
    res.setHeader('Access-Control-Allow-Origin','*');


    event.on('logoutuser',(e)=>{
      console.log(`fromuserlogupdate:${e}`)
      res.write(`data:${JSON.stringify(e)}\n\n`)
    })
    
    // setInterval(()=>{
    //    const log_user1 = 'no_user';
    //    if(req.flash('logout_user')[0]){
    //     res.write(`data:${JSON.stringify(req.flash('logout_user')[0])}\n\n`)
    //    }
    //    else{
    //     res.write(`data:${JSON.stringify(log_user1)}\n\n`)
    //    }
      
       
    //   //  console.log(' i am running')
    //   //  console.log(log_user)
    // },1000);
})

router.post('/adminlogout/:param',(req,res)=>{
  const logoutuser =req.params.param;
  event.emit('logoutuser',logoutuser);
  // req.flash('logout_user',`${logoutuser}`)

  // console.log(req.flash('logout_user'))
  console.log(`paramsvalue: ${logoutuser}`);
  if(req.user){
    dbconnect.query(`update user_sessions
  set session_end_date = '${req.session.currentTime.date}',
  session_end_time = '${req.session.currentTime.time}',
  logout_status='${req.user[0].user_id}'
  where user_login_id ='${logoutuser}' and session_end_time is null
  `,(error,results)=>{
    if(error){
      console.log(error)
    }
    else{
      res.send('sessionupdated');
    }
  })
  }
  // res.setHeader('Content-Type','text/event-stream');
  // res.setHeader('Access-Control-Allow-Origin','*');
  // setInterval(()=>{
  //    const log_user = logoutuser;
  //    res.write(`logout_user:${JSON.stringify(log_user)}\n\n`)
  // },1000)
});

router.post('/pdfstatus/:pdf_name',(req,res,next)=>{
  let updf =req.params.pdf_name.split(":");
  console.log(updf);
  if(req.user){

    dbconnect.query(`SELECT * FROM user_sessions where user_name = '${req.user[0].user_name}' order by id desc limit 1`, (error, results,fields)=>{
      if(error){
        console.log(error)
      }
      else{
        if(results[0].user_id == req.session.passport.user){

          priviousSessionId = results[0].id;
        console.log(results.length);
        console.log(priviousSessionId);
        dbconnect.query(`update user_sessions 
           set session_end_date = '${req.session.currentTime.date}',
           session_end_time = '${req.session.currentTime.time}',
           logout_status= Null 
          where id =${priviousSessionId}`,(err,results)=>{
            if(err){
              console.log(err)
            }
            else{
              dbconnect.query(`insert into user_sessions (user_name,user_login_id,user_id,agent_status,session_start_date,session_start_time) values('${req.user[0].user_name}','${req.user[0].user_id}',
             '${req.user[0].id}', '${updf[1]}','${req.session.currentTime.date}',
            '${req.session.currentTime.time}')`)
            }
          })
        
        }
        
      }
      
          
  }
  )
  }
  else{
    next()
  }


  
  
});

router.post('/reports',(req,res,next)=>{

  let ip1 =req.body.effdate1;
  let ip2 =req.body.effdate2;
  let ip3 =req.body.reportinput;

  console.log(ip1);
  console.log(ip2);
  console.log(ip3);

if(req.body.reportinput ==='Total_login_time'){
  try {
    dbconnect.query(`select user_name as Agent_Name, date_format(session_start_date,'%d-%m-%y') as date , sec_to_time(sum(dff))as total_login_time from  
    (select *,timestampdiff(SECOND,session_start_time,session_end_time)as dff from user_sessions where session_start_date between '${req.body.effdate1}' and '${req.body.effdate2}' ) as xyz group by user_name , session_start_date ;`,(err,results)=>{
    
      if(err){
        console.log(err)
      }
      else{
        let reportarray =[]
        
        let reportsData =  JSON.parse(JSON.stringify(results));
          reportsData.forEach(element => {
        // [Agent_Name,date,total_login_time] = element;
              reportarray.push(element);
          });
          const reportheader =['Agent_Name','date','total_login_time']
         const csvdata = new csvparser(reportheader)
              const Total_login_time = csvdata.parse(reportarray);
              res.setHeader('Content-Disposition',`attachment; filename="Total Login Report_${req.session.currentTime.time}.csv"`)
              res.setHeader('Content-Type','text/csv')
              
              res.status(200).end(Total_login_time)
              next()
        // res.send(reportarray)
      }

    })
  } catch (error) {
    
  }

}
else{
  try {
    dbconnect.query(`select user_name as Agent_Name,agent_status as Agent_activity, date_format(session_start_date,'%d-%m-%y') as date , sec_to_time(sum(dff))as total_login_time from  
    (select *,timestampdiff(SECOND,session_start_time,session_end_time)as dff from user_sessions where session_start_date between '${req.body.effdate1}' and '${req.body.effdate2}' ) as xyz group by user_name ,agent_status, session_start_date ;`,(err,results)=>{
    
      if(err){
        console.log(err)
      }
      else{
        let reportarray =[]
        
        let reportsData =  JSON.parse(JSON.stringify(results));
          reportsData.forEach(element => {
        // [Agent_Name,date,total_login_time] = element;
              reportarray.push(element);
          });
          const reportheader =['Agent_Name','date','total_login_time']
         const csvdata = new csvparser(reportheader)
              const Agent_Activity_Report = csvdata.parse(reportarray);
              res.setHeader('Content-Type','text/csv')
              res.setHeader('Content-Disposition',`attachment; filename="Agent Activity Report_${req.session.currentTime.time}.csv"`)
              res.status(200).end(Agent_Activity_Report)
              next()
        // res.send(reportarray)
      }

    })
  } catch (error) {
    
  }
}

  


}

)



module.exports = router;
