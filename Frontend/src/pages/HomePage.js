export default function Navbar() {
    return (
        <div className='page-div' style={{
            display: 'flex', justifyContent: 'center',
            alignItems: 'center', height: '90vh', marginLeft: '15vh'
        }}>
            <img
                src={'home_icon.png'}
                alt='home_icon'
                style={{cursor: 'pointer', width: '220px', height: '300px'}}
                onClick={() => {
                    window.location.href = '/tutorial'
                }}
            />
        </div>
    )
}
