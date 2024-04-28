Array.from(document.getElementsByClassName('btn')).forEach((e)=>{
    console.log(e);
    e.addEventListener('click',(e)=>{
        console.log(e.target.id);
        const param = e.target.id;
        console.log(param)
        fetch(`/adminlogout/${param}`,{
            method:'post'
        }).then((e)=>{
            console.log(e);
            return e.text();
        }).then((data)=>{
            if(data==='sessionupdated'){
                window.location.href ='/adminlogout';
            }
        })
    })
})

// document.getElementsByClassName('btn').addEventListener('click',(e)=>{
//             console.log(e.target.value);
//             const param = e.target.value;
//             console.log(param)
//             fetch(`/adminlogout/${param}`,{
//                 method:'post'
//             })
//         })