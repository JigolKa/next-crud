import { useState } from "react"
import {
  createStyles,
  Navbar as NavbarComponent,
  Group,
  Code,
  Divider,
  useMantineTheme,
} from "@mantine/core"
import { useContext } from "react"
import { SelectedCategoryContext } from "../contexts/SelectedCategory"
import Link from "next/link"
import toSlug from "../utils/toSlug"

const useStyles = createStyles((theme) => {
  return {
    header: {
      paddingBottom: theme.spacing.md,
      marginBottom: theme.spacing.md * 1.5,
      borderBottom: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[2]
      }`,
    },

    title: {
      color: theme.colors.gray[6],
      paddingBottom: theme.spacing.md,
      display: "block",
      fontSize: 14,
      fontWeight: 600,
    },

    link: {
      ...theme.fn.focusStyles(),
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      fontSize: theme.fontSizes.sm,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[1]
          : theme.colors.gray[7],
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      borderRadius: theme.radius.sm,
      fontWeight: 500,

      "&:hover": {
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[6]
            : theme.colors.gray[0],
        color: theme.colorScheme === "dark" ? theme.white : theme.black,
      },
    },

    linkActive: {
      "&, &:hover": {
        backgroundColor: theme.fn.variant({
          variant: "light",
          color: theme.primaryColor,
        }).background,
        color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
          .color,
      },
    },
  }
})

const data = [
  { label: "Installation", title: "Getting started" },
  { label: "Quick Start", title: "Getting started" },
  { label: "Usage", title: "Getting started" },
]

export default function Navbar() {
  const { classes, cx } = useStyles()
  const { category, setCategory } = useContext(SelectedCategoryContext)
  const theme = useMantineTheme()

  return (
    <NavbarComponent height={"100vh"} width={{ sm: 300, base: 300 }} p="md">
      <NavbarComponent.Section grow>
        <Group className={classes.header} position="apart">
          <Link
            href="/"
            style={{
              color: theme.colorScheme === "dark" ? "#fff" : "#000",
              textDecoration: "none",
            }}
          >
            <h2>Next Crud</h2>
          </Link>
          <Code sx={{ fontWeight: 700 }}>v1.0.8</Code>
        </Group>
        {data
          .map((v) => v.title)
          .filter((v, i, a) => a.indexOf(v) == i)
          .map((t, i) => (
            <>
              <span className={classes.title}>{t}</span>
              {data
                .filter((v) => v.title === t)
                .map((item) => (
                  <Link
                    className={cx(classes.link, {
                      [classes.linkActive]: item.label === category,
                    })}
                    href={`#${toSlug(item.label)}`}
                    key={item.label}
                    onClick={(e) => {
                      setCategory && setCategory(item.label)
                    }}
                  >
                    <span>{item.label}</span>
                  </Link>
                ))}
            </>
          ))}
        {/* {links} */}
      </NavbarComponent.Section>
    </NavbarComponent>
  )
}
