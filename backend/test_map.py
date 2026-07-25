from app.tools.maps import MapsTool, LocationInput

result = MapsTool.geocode(
    LocationInput(
        location="Technopark, Thiruvananthapuram"
    )
)

print(result)