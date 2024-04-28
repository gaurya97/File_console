
let user_role = document.getElementById('role').value;
if(user_role ==='Agent'){
    document.getElementById('emt').style.height='5vh';
    document.getElementById('emt').style.width='45vw';
    document.getElementById('al').classList.remove('hidden')
    document.getElementById('ac').remove()
    document.getElementById('au').remove()
    document.getElementById('af').remove()
    document.getElementById('ar').remove()
    document.getElementById('rep-boxid').remove()
    document.getElementById('clo').style.display='flex'
    
}
else if(user_role ==='Opsam'){
    document.getElementById('emt').style.height='5vh';
    document.getElementById('emt').style.width='25vw';
    document.getElementById('al').classList.remove('hidden')
    document.getElementById('ar').classList.remove('hidden')
    document.getElementById('ac').classList.remove('hidden')
    document.getElementById('ar').addEventListener('click',(e)=>{
    
   
        document.getElementById('rep-boxid').style.transform ="scale(1)";
        
       
        
    });
    document.getElementById('Cancel').addEventListener('click',(e)=>{
    
        
        document.getElementById('rep-boxid').style.transform ="scale(0)";
    });
    
}
else{
    document.getElementById('al').classList.remove('hidden')
    document.getElementById('ac').classList.remove('hidden')
    document.getElementById('au').classList.remove('hidden')
    document.getElementById('af').classList.remove('hidden')
    document.getElementById('ar').classList.remove('hidden')
    document.getElementById('ar').addEventListener('click',(e)=>{
    
   
        document.getElementById('rep-boxid').style.transform ="scale(1)";
        
       
        
    });
    document.getElementById('Cancel').addEventListener('click',(e)=>{
    
        document.getElementById('rep-boxid').style.transform ="scale(0)";
    });
}

let [hours,minutes,second]=[0,0,0];
let [hours1,minutes1,second1]=[0,0,0];
let logout=false;

const eventsourse =new EventSource('/userlogupdate');
eventsourse.onmessage =function (event){
    console.log(event.data);
    const log_user =JSON.parse(event.data);
    console.log(log_user);
    if(document.getElementById('user_id').value === log_user ){
        window.location.href ="/profile";
    }
}

eventsourse.onerror =function (err){
    console.log(err);
}


console.log(document.getElementsByClassName('pdfs'));

// Array.from(document.getElementsById('selc')).forEach((e)=>{
//     e.addEventListener('change',(e)=>{
//         console.log(e.target.value);
//         document.getElementById('ifr').src =e.target.value;
//         console.log(document.getElementById('ifr').src);
//     })
// })


document.getElementById('selc').addEventListener('change',async(e)=>{
    resettimer()
    
    let pdf_name= e.target.value.split("/");
        console.log(pdf_name)

    fetch(`/pdfstatus/:${pdf_name[2]}`,{
        method: 'post'
    }).then((e)=>{
        console.log(e.status);
    })
    document.getElementById('ifr').src =e.target.value;
    console.log(e.target.value);

    
    console.log(document.getElementById('ifr').src);
})


let updatetimer =()=>{
    // document.getElementById('sec').innerHTML=`${second}`
    // document.getElementById('min').innerHTML=`${minutes}:`
    // document.getElementById('hr').innerHTML=`${hours}:`
    second++

    if(second==59){
        second=0;
        minutes++
        // console.log(second)
        // console.log(minutes)
    }
    else if(minutes==59 && second==59){
        hours++
        minutes=0
        // console.log(minutes)
    
    }
}

let updatetimer1 =()=>{
    document.getElementById('sec').innerHTML=`${String(second1).padStart(2,'0')}`
    document.getElementById('min').innerHTML=`${String(minutes1).padStart(2,'0')}:`
    document.getElementById('hr').innerHTML=`${String(hours1).padStart(2,'0')}:`
    second1++

    if(second1==59){
        second1=0;
        minutes1++
        // console.log(second)
        // console.log(minutes)
    }
    else if(minutes1==59 && second1==59){
        hours1++
        minutes1=0
        // console.log(minutes)
    
    }
}


resetinterval = async()=>{
    if(minutes==10 && second >=0){
        await fetch('/forcelogout',{
            method:'post'
        });
        window.location.href ="/login";
        console.log('login again')
        clearInterval(interval);
        resettimer()
        
    }

}

resettimer=()=>{
  
    hours=0;
    minutes=0;
    second=0;
}

// document.addEventListener('mouseover',()=>{
//     resettimer()
// })
document.addEventListener('mousemove',()=>{
    resettimer()
})
window.addEventListener('scroll',()=>{
    resettimer()
})

let interval =setInterval(()=>{
    // console.log("hii");
    // console.log(`minutes:${minutes} and seconds:${second}`);
    updatetimer();
    updatetimer1();
    resetinterval();
},1000);


