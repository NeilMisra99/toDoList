exports.getDate = () => 
{
    const options = { 
        month: 'long',
        weekday: 'long', 
        day: 'numeric' 
    };
    const today  = new Date();    
    return today.toLocaleDateString("en-US", options);
}
