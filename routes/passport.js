const LocalStratergy =require('passport-local')
const flash =require('connect-flash');
const dbconnect =require('./dbconfig');
module.exports.initializePassport = (passport)=>{
 passport.use(new LocalStratergy((username,password,done)=>{
    dbconnect.query(`select * from users where user_id ='${username}'`,(err,results)=>{
        if(err) {
        return done(null,false,{
            message:'Invalid Username'
        });
                }
         else {
            
            const user = results.map((e)=>{
                return e;
                })
            

                    dbconnect.query(`SELECT * FROM user_sessions where user_login_id = '${username}' order by id desc limit 1`,(err,results)=>{
                        try {
                            if(err){
                                return done(null,false,{
                                    message:'Invalid Username'
                                });
                            }
                            else{
                              if(results==0 || results[0].session_end_time !== null ){
                                if(!user){
                                    return done(null,false,{
                                        message:'Invalid Username'
                                    });
                            
                                }
                                else if(user[0].password !== password) 
                                return done(null,false,
                                    {
                                        message:'Invalid Password'  
                                    });
                                    else{
                                        return done(null,user); 
                                    }
                            
                                
                              }
                              else{
                                return done(null,false,
                                    {
                                        message:'Already logged in on another machine'  
                                    });
                              }
                            }
                        } catch (error) {
                            return done(null,false,{
                                      message:'Invalid Username'
                                  });
                        }
                        
                        
                    })
                
    

                
                // if(!req.user){
                    
                // }
                }

      
        // try {
            // if(user[0].user_id === req.user[0].user_id){
            //     return done(null,false,{
            //         message:'Already logged in on another machine'
            //     });
        
            // }
        //   console.log(`session stored user_id =${req.user[0].user_id}`);

            
        // } catch (error) {
        //     return done(null,false,{
        //         message:'Invalid Username'
        //     }); 
        // }



       
      })

 }))

 passport.serializeUser((user,done)=>{
    done(null,user[0].id)
    })
passport.deserializeUser( (id,done)=>{
    try {
        dbconnect.query(`select * from users where id ='${id}'`,(err,results)=>{
            if(err) done(err,false)
            const user = results.map((e)=>{
            return e;
            })
        done(null,user);
        })
    } catch (error) {
        done(error,false);
        
    }
    
    })
}
exports.isAthonticated =(req,res,next)=>{
    console.log(req.user)
    if(req.user) return next();
    res.redirect("/login");
};