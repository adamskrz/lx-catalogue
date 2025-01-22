# update _data/gobos.yml with stock numbers from _stacktake/gobos.txt

import yaml
from operator import itemgetter


igobos = {}


def input_gobo(make, code, size, location, amount):
    if make not in igobos:
        igobos[make] = {}
    if code not in igobos[make]:
        igobos[make][code] = {}
    if size not in igobos[make][code]:
        igobos[make][code][size] = {}
    igobos[make][code][size][location] = amount


with open("_stocktake/gobos.txt", "r") as f:
    text = f.read().split("\n\n\n")

for location in text:
    if location != "":
        print("\nProcessing location:")
        print(location)
        location_name = location.split("\n")[0].strip()
        for line in location.split("\n")[1:]:
            if line == "":
                continue

            # e.g. 1x Goboland 2 102 000 B, 2x Custom WSAF splodge A, 2x 77721 A
            line_split = line.split(" ")

            # remove and trim count - 1x -> 1
            amount = int(line_split.pop(0)[:-1])

            # remove and upper size - b -> B
            size = line_split.pop().upper()

            # we now have either a manuafturer name + code, or just a code
            if len(line_split) > 1:
                manufacturer_name = line_split.pop(0)
                code = " ".join(line_split)
            else:
                manufacturer_name = "Rosco"
                code = line_split[0]

            print(f"{manufacturer_name}: {code}, {size} size, {amount} in {location_name}")
            input_gobo(manufacturer_name, code, size, location_name, amount)


# get stock totals
for make in igobos:
    for code in igobos[make]:
        for size in igobos[make][code]:
            igobos[make][code][size]["total"] = sum(igobos[make][code][size].values())

with open("_data/gobos.yml", "r") as f:
    ogobos = yaml.load(f, Loader=yaml.Loader)

print("{} gobo makes to process, processing all known".format(len(igobos)))


for gobo in ogobos:
    make = gobo["make"]
    code = gobo["number"]
    gobo["stock_locations"] = []
    gobo["stock"] = []
    if make in igobos and code in igobos[make]:
        # In input list, add what we have
        for size, amount in igobos[make][code].items():
            for location, qty in amount.items():
                if location == "total":
                    gobo["stock"].append({"size": size, "qty": qty})
                    continue
                gobo["stock_locations"].append({"size": size, "qty": qty, "location": location})

        # Done with gobo, pop from dict
        igobos[make].pop(code)
        if len(igobos[make]) == 0:
            igobos.pop(make)

print("{} gobo makes to process, processing unknowns".format(len(igobos)))

for make in igobos:
    for code, sizes in igobos[make].items():
        gobo = {"make": make, "number": code}
        locations = []
        stock = []
        for size, amount in sizes.items():
            for location, qty in amount.items():
                if location == "total":
                    stock.append({"size": size, "qty": qty})
                    continue
                locations.append({"size": size, "qty": qty, "location": location})
        gobo["stock_locations"] = locations
        gobo["stock"] = stock
        ogobos.append(gobo)

ogobos = sorted(ogobos, key=lambda x: (-1 * str(x["make"]), str(x["number"])))

with open("_data/gobos.yml", "w") as f:
    stream = yaml.dump(ogobos, Dumper=yaml.Dumper, width=720, indent=2)
    stream = stream.replace("\n- ", "\n\n- ")
    f.write(stream)

print("done")
