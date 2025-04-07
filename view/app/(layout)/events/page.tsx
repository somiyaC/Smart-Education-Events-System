import AllEvents from './eventList';

export default function events() {
    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-4 ml-5">Events</h1>
            <AllEvents />
        </div>
    )
}
