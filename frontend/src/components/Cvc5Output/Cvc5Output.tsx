import '../../scss/Cvc5Output.scss';

function Cvc5Output({content}: any){
    if (content) {
        return (
            <div className='cvc5Output'>
                    {content}
            </div>
        )
    }
    return <div></div>;
}

export default Cvc5Output;
